import { Response } from "./_types/project";

export class LocalCache {
    private static _instance: LocalCache;
    private _cache = new Map<string, any>();
    private timeouts = new Map<string, NodeJS.Timeout>();

    private constructor() { }

    public static getInstance(): LocalCache {
        if (!LocalCache._instance) {
            LocalCache._instance = new LocalCache();
        }
        return LocalCache._instance;
    }

    public get(key: string): any | undefined {
        return this._cache.get(key);
    }

    public set(key: string, value: any, invalidateInMs?: number): void {
        if (invalidateInMs) {
            clearTimeout(this.timeouts.get(key));
            this.timeouts.set(key, setTimeout(() => {
                this._cache.delete(key);
            }, invalidateInMs));
        }
        this._cache.set(key, value);
    }

    static getKey(path: string, response: Response): string {
        return `response-${path}-${response.model}-${response.count}-${JSON.stringify(response.forwardProperties)}`;
    }
}