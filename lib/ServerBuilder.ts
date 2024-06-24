import express, { Request, Response as ExpressResponse, Application, NextFunction } from 'express';
import { Endpoint, Model, Response } from "./_types/project";
import { modelGenerator } from './model/modelGenerator';
import e from 'express';
import { LocalCache } from './LocalCache';

import cookieParser from 'cookie-parser';

const COOKIE_NAME = 'api-hub.key';

function getCookie(req: Request) {
    const cookie = req.cookies[COOKIE_NAME];
    if (cookie) {
        const fullCookie = `${cookie}-${req.path}`;
        return fullCookie;
    }
    return null;
}


export class ServerBuilder {
    private _projectName: string | undefined;
    private _username: string | undefined;
    private _projectRootUrl: string | undefined;
    private _customDomain: boolean | undefined;
    private _endpoints: Endpoint[] | undefined;
    private models: Model[] | undefined;
    private _port: number | undefined;
    private cache: LocalCache;

    private _server: Application | undefined;

    constructor(port = 3000) {
        this._port = port;
        this.cache = LocalCache.getInstance();
    }

    public setProjectName(projectName: string): ServerBuilder {
        this._projectName = projectName;
        return this;
    }

    public setUsername(username: string): ServerBuilder {
        this._username = username;
        return this;
    }

    public setProjectRootUrl(projectRootUrl: string): ServerBuilder {
        this._projectRootUrl = projectRootUrl;
        return this;
    }

    public setCustomDomain(customDomain: boolean): ServerBuilder {
        this._customDomain = customDomain;
        return this;
    }

    public setEndpoints(endpoints: Endpoint[]): ServerBuilder {
        this._endpoints = endpoints;
        return this;
    }

    public setModels(models: Model[]): ServerBuilder {
        this.models = models;
        return this;
    }

    public validate(): boolean {
        return true;
    }

    public build(): ServerBuilder {
        const newServer = express();
        this._server = newServer;
        newServer.use(cookieParser());
        newServer.use((req, res, next) => this._beforeRequest(req, res, next, this.cache));
        if (this._endpoints && this._endpoints.length > 0) {
            for (const endpoint of this._endpoints) {
                const path = `${this._projectRootUrl}${endpoint.path}`;
                // newServer.use(endpoint.path, this._handleEndpoint(endpoint));
                for (const method in endpoint.responses) {
                    const response = endpoint.responses[method as keyof typeof endpoint.responses];
                    if (response) {
                        if (method === 'GET') {
                            newServer.get(path, this._handleResponse(path, response));
                        } else if (method === 'POST') {
                            newServer.post(path, this._handleResponse(path, response));
                        } else if (method === 'PUT') {
                            newServer.put(path, this._handleResponse(path, response));
                        } else if (method === 'DEL') {
                            newServer.delete(path, this._handleResponse(path, response));
                        } else {
                            throw new Error(`Unsupported method: ${method}`);
                        }

                    }
                }
            }
        }

        // newServer.use(this._afterResponse)

        return this;
    }

    public run() {
        if (this._server) {
            this._server.listen(this._port, () => {
                console.log(`Server running on port ${this._port}`);
            });
        }
    }

    private _beforeRequest(req: Request, res: ExpressResponse, next: NextFunction, cache: LocalCache) {
        const cookie = getCookie(req)
        if (cookie) {
            const data = cache.get(cookie);
            if (data) {
                res.send(data);
                return;
            }
        }
        next();
    }

    private _afterResponse(data: any, req: Request) {
        const cookie = getCookie(req)
        if (cookie && data) {
            this.cache.set(cookie, data, 60 * 1000 * 60);
        }
    }

    // Private methods
    private _handleResponse(path: string, response: Response) {
        return (req: Request, res: ExpressResponse, next: NextFunction) => {

            // const key = JSON.stringify(response);
            if (response.content_type) {
                res.set('Content-Type', response.content_type);
            }
            res.status(response.status)
            if (response.cache) {
                const key = LocalCache.getKey(path, response);
                const data = this.cache.get(key)
                if (data) {
                    res.send(data);
                    return;
                }
            }
            let overrides = {}
            if (response.forwardProperties) {
                overrides = response.forwardProperties.reduce((acc, key) => {
                    acc[key] = req.params[key];
                    return acc;
                }, {} as Record<string, string>);
            }
            let data;
            if (response.model && this.models) {
                if (response.count) {
                    if (response.count > 0) {
                        const allModels = this.models
                        data = Array(response.count).fill(0).map(function (_, i) { return modelGenerator(allModels, response.model, i, false, overrides) });
                    } else {
                        data = modelGenerator(this.models, response.model, false, false, overrides);
                    }
                } else {
                    data = modelGenerator(this.models, response.model, false, false, overrides);
                }
            } else if (response.body) {
                data = response.body;
            }

            if (response.cache) {
                const key = LocalCache.getKey(path, response);
                this.cache.set(key, data, response.cache);
            }

            this._afterResponse(data, req);
            res.send(data);
        }
    }
}