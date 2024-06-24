import { generatorNames } from "../../generators";
import { Project, Endpoint, Response, Model } from "../project";

// Type guard function to check if an object matches the Project type
export function isProject(obj: any): obj is Project {
    if (
        typeof obj.project_name !== 'string' ||
        typeof obj.username !== 'string' ||
        typeof obj.project_root_url !== 'string'        
    ) {
        throw new Error('Invalid project object');
    }
    if (obj.custom_domain && typeof obj.custom_domain !== 'string') {
        throw new Error('Invalid custom domain');
    }

    let modelNames: string[] = [];
    if (obj.models) {
        modelNames = obj.models.map((model: any) => model?.name);
        if (!Array.isArray(obj.models)) {
            throw new Error('Invalid models array');
        }
        for (const model of obj.models) {
            if (!isModel(model, modelNames)) {
                throw new Error(`Invalid model: ${model?.name}`);
            }
            // modelNames.push(model.name);
        }
    }

    if (obj.endpoints){
        if (!Array.isArray(obj.endpoints)) {
            throw new Error('Invalid endpoints array');
        }
        for (const endpoint of obj.endpoints) {
            if (
                typeof endpoint.id !== 'string' ||
                typeof endpoint.path !== 'string' ||
                !isEndpointResponse(endpoint.responses, modelNames)
            ) {
                throw new Error(`Invalid endpoint: ${endpoint?.id}`);
            }
        }
    }
    return true;
}

export function isEndpointResponse(obj: any, modelNames: string[] = []): obj is Endpoint {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Invalid endpoint response');
    }
    
    // Check each optional property individually
    if (obj.GET !== undefined) {
        if (!isResponse(obj.GET, modelNames)) {
            throw new Error('Invalid GET response');
        }
    }

    if (obj.POST !== undefined) {
        if (!isResponse(obj.POST, modelNames)) {
            throw new Error('Invalid POST response');
        }
    }

    if (obj.PUT !== undefined) {
        if (!isResponse(obj.PUT, modelNames)) {
            throw new Error('Invalid PUT response');
        }
    }

    if (obj.DEL !== undefined) {
        if (!isResponse(obj.DEL, modelNames)) {
            throw new Error('Invalid DEL response');
        }
    }

    return true;
}


export function isResponse(obj: any, modelNames: string[] = []): obj is Response {
    if (
        typeof obj.status !== 'number'        
    ) {
        throw new Error('Invalid response status');
    }
    if (!obj.body) {
        if (obj.model) {
            if (!modelNames.includes(obj.model)) {
                throw new Error(`Invalid model: ${obj.model}`);
            }
        } else {
            throw new Error('Invalid response body');
        }
    } else {
        if (!['string', "object"].includes(typeof obj.body)) {
            throw new Error('Invalid response body 2');
        }

        if (typeof obj.body === 'object') {
            for (const field of Object.keys(obj.body) ) {
                const data = {
                    name: field,
                    type: obj.body[field]
                }
                if (!isModelField(data, modelNames, true)) {
                    throw new Error(`Invalid field: ${data?.name}`);
                }
            }
        }
    }
    return true;
}

export function isModel(obj: any, modelNames: string[] = []): obj is Model {
    if (typeof obj.name !== 'string') {
        return false;
    }
    
    if (obj.fields) {
        // if (!Array.isArray(obj.fields)) {
        //     throw new Error('Invalid fields array');
        // }
        for (const field of Object.keys(obj.fields) ) {
            const data = {
                name: field,
                type: obj.fields[field]
            }
            if (!isModelField(data, modelNames)) {
                throw new Error(`Invalid field: ${data?.name}`);
            }
        }
    } else {
        throw new Error('Invalid model fields');
    }

    return true;
}

export function isModelField(obj: any, modelNames: string[] = [], isStringAllowed = false): obj is Model['fields'][number] {
    if (typeof obj.name !== 'string') {
        throw new Error('Invalid field name');
    }
    if (obj.type) {
        if (typeof obj.type !== 'string') {
            throw new Error(`Invalid field type: ${obj.type} 1`);
        }
        if (modelNames.includes(obj.type)) {
            return true;
        }
        if (generatorNames.includes(obj.type)) {
            return true;
        }
        if (isStringAllowed) {
            return true;
        }
        throw new Error(`Invalid field type: ${obj.type}`);
    }
    return true;
}