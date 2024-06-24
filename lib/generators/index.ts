import { fa, faker } from '@faker-js/faker';

const stringGenerators = {
    string: function (length: number = 10) {
        return Array(length).fill(0).map(() => Math.random().toString(36).substring(2)).join('');
    }
}

const numberGenerators = {
    id: function (...args: Parameters<typeof faker.string.uuid>) {
        return faker.string.uuid(...args);
    },
    number: function (...args: Parameters<typeof faker.number.int>) {
        return faker.number.int(...args);
    },
    int: function (...args: Parameters<typeof faker.number.int>) {
        return faker.number.int(...args);
    },
    float: function (...args: Parameters<typeof faker.number.float>) {
        return faker.number.float(...args);
    },
    boolean: function (...args: Parameters<typeof faker.datatype.boolean>) {
        return faker.datatype.boolean(...args);
    },
}

const fakerGenerators = {
    ...faker.airline,
    ...faker.animal,
    ...faker.color,
    ...faker.commerce,
    ...faker.company,
    ...faker.date,
    ...faker.finance,
    ...faker.git,
    ...faker.hacker,
    ...faker.helpers,
    ...faker.image,
    ...faker.internet,
    ...faker.location,
    ...faker.lorem,
    ...faker.music,
    ...faker.number,
    ...faker.person,
    ...faker.phone,
    ...faker.science,
    ...faker.string,
    ...faker.system,
    ...faker.vehicle,
    ...faker.word
}

export const generatorNames = [...Object.keys(stringGenerators), ...Object.keys(numberGenerators), ...Object.keys(fakerGenerators)] as const;


export type GeneratorName = typeof generatorNames[number];

export interface Generator<T> {
    (...args: any[]): T;
}

// @ts-ignore
export const generators: Record<GeneratorName, Generator<any>> = {
    ...stringGenerators,
    ...numberGenerators,
    ...fakerGenerators
}

export function getGenerator<T>(name: GeneratorName): Generator<T> {
    return generators[name] as Generator<T>;
}
