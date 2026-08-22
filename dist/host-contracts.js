function argumentRecord(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('tool arguments must be a JSON object');
    }
    return value;
}
function schemaRecord(value, label) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        throw new Error(`${label} must be an object`);
    return value;
}
/** Convert the Harness author DSL's per-property `required: true` into raw JSON Schema arrays. */
function rawSchema(value) {
    if (Array.isArray(value))
        return value.map(rawSchema);
    if (typeof value !== 'object' || value === null)
        return value;
    const source = value;
    const result = {};
    for (const [key, child] of Object.entries(source)) {
        if (key === 'required')
            continue;
        if (key === 'properties') {
            const properties = schemaRecord(child, 'schema properties');
            const converted = {};
            const required = [];
            for (const [propertyName, propertySchema] of Object.entries(properties)) {
                const record = schemaRecord(propertySchema, `schema property ${propertyName}`);
                if (record.required === true)
                    required.push(propertyName);
                converted[propertyName] = rawSchema(record);
            }
            result.properties = converted;
            if (required.length > 0)
                result.required = required;
            continue;
        }
        result[key] = rawSchema(child);
    }
    return result;
}
/**
 * Define the public Harness ToolDefinition shape without loading another copy
 * of the host registry package. Raw tool definitions validate their own input;
 * this wrapper enforces the root object and each tool validates its fields.
 */
export function defineRemotionTool(options) {
    return {
        ...options,
        parameters: rawSchema({ type: 'object', properties: options.parameters }),
        output: {
            schema: rawSchema(options.output.schema),
            render: (args, value) => options.output.render(argumentRecord(args), value),
            ...options.output.presentationMeta === undefined ? {} : {
                presentationMeta: (args, value) => options.output.presentationMeta?.(argumentRecord(args), value),
            },
        },
        execute: (args, exec) => options.execute(argumentRecord(args), exec),
        ...options.presentCall === undefined ? {} : {
            presentCall: (args) => options.presentCall?.(argumentRecord(args)),
        },
        ...options.presentResult === undefined ? {} : {
            presentResult: (args, result) => options.presentResult?.(argumentRecord(args), result),
        },
    };
}
//# sourceMappingURL=host-contracts.js.map