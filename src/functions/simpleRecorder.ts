import { app, HttpRequest, HttpResponse, HttpResponseInit, InvocationContext } from "@azure/functions";
import Replicate from "replicate";

export async function langOptions(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    return { 
        body: `[{ "code": "chn", "name": "Mandarin Chinese" },{"code":"eng","name":"English"},{"code":"fre","name":"French"},{"code":"jp","name":"Japanese"}]`,
        headers: {'Content-Type': 'application/json'}
    };
};

app.http('langOptions', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: langOptions

});

const replicateToken = process.env.REPLICATE_API_TOKEN;

if (!process.env.hasOwnProperty('REPLICATE_API_TOKEN')) {
  throw new Error('REPLICATE_API_TOKEN is not set');
}


type ReplicateRetrunData = {
  audio_output: string,
  text_output: string
};

export async function translate(request: HttpRequest,context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);
    
    const replicate = new Replicate({ auth: replicateToken }); 
    var lang="";
    var file;
    await request.formData().then( (data)=>{

        data.forEach((value,key)=>{
            if(key == "lang"){
                lang = value.toString();
            }
            if(key == "file"){
                file = value;
            }
        })

    }
    );

    console.log("file size:"+file.size)  
    const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')


    const model = "cjwbw/seamless_communication:668a4fec05a887143e5fe8d45df25ec4c794dd43169b9a11562309b2d45873b0";
    const input = {
        task_name: "S2ST (Speech to Speech translation)",
        input_audio: `data:${file.type};base64,${base64}`,
        input_text_language: "None",
        max_input_audio_length: 60,
        target_language_text_only: lang,
        target_language_with_speech: lang
      };
    var replicateData;
    await replicate.run(model, { input }).then((data:ReplicateRetrunData)=>{
        context.log(`formData key: "${data}"`);
        replicateData = data;
    });
    return { 
        body: `{"url": "${replicateData.audio_output}","text": "${replicateData.text_output}"}`,
        headers: {'Content-Type': 'application/json'}
    };

};

app.http('upload', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: translate

});
