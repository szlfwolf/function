import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

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
