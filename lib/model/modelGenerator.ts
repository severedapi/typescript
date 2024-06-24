import { faker } from "@faker-js/faker";
import { Model } from "../_types/project";
import { generatorNames, getGenerator } from "../generators";


export function modelGenerator(models: Model[], modelName: string, seed: number | false = false, parent: string | false = false, overrides: Record<string, string> = {}): Record<string, any> {
    const model = models.find(m => m.name === modelName);
    if (!model) {
        throw new Error(`Model ${modelName} not found`);
    }

    if (seed) {
        faker.seed(Math.ceil(seed * 3.14 * Math.random()));
    }

    let data: Record<string, any> = {};
    for (const field of Object.keys(model.fields)) {
        const value = model.fields[field]
        if (parent) {
            if (value === parent) {
                continue;
            }
        }
        if (overrides[field]) {
            data[field] = overrides[field];
        } else if (models.map(m => m.name).includes(value)) {
            data[field] = modelGenerator(models, value, (seed || 1) * 2, modelName);
        } else if (generatorNames.includes(value)) {
            const generator = getGenerator(value);
            data[field] = generator();
        } else {
            data[field] = value;
        }
    }

    return data;
}