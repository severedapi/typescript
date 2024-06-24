// export type EndpointResponse = {
//     GET?: {
//         status: number;
//         body: string;
//     };
//     POST?: {
//         status: number;
//         body: string;
//     };
//     PUT?: {
//         status: number;
//         body: string;
//     };
//     DEL?: {
//         status: number;
//         body: string;
//     };
// };

import { GeneratorName } from "../../generators";

type HttpMethod = "GET" | "POST" | "PUT" | "DEL" | "PATCH" | "OPTIONS";
type HttpStatus = 200 | 201 | 202 | 204 | 400 | 401 | 403 | 404 | 500 | 501;

type JsonBody = {
    [key: string]: string | GeneratorName | number | boolean | JsonBody;
}

export type Response = {
    status: HttpStatus;
    cache?: number | false; // milliseconds to cache the response, false to disable caching
    content_type?: string;
    body?: string | GeneratorName | JsonBody;
    model: string;
    count?: number;
    forwardProperties?: string[];
}

export type Endpoint = {
    id: string;
    path: string;
    responses: {
        [key in HttpMethod]: undefined | Response
    }
}

export type Model = {
    name: string;
    fields: {
        [name: string]: GeneratorName;
    }
}

export type Project = {
    project_name: string;
    username: string;
    project_root_url: string;
    custom_domain: boolean;
    endpoints: Endpoint[];
    models: Model[];
};