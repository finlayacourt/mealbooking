import { InvalidData } from "../../errors.ts"

type Schema = {
	type: "number"
} | {
	type: "string"
} | {
	type: "array"
	props: Schema
} | {
	type: "object"
	props: Record<string, Schema>
}

export type SchemaToType<S extends Schema> = S["type"] extends "number" ? number
	: S["type"] extends "string" ? string
	: // @ts-ignore
	S["type"] extends "array" ? SchemaToType<S["props"]>[]
	: // @ts-ignore
	{ [P in keyof S["props"]]: SchemaToType<S["props"][P]> }

export function validate<S extends Schema>(
	schema: S,
	input: unknown,
	path = "$",
): asserts input is SchemaToType<S> {
	switch (schema.type) {
		case "number":
			if (typeof input !== "number") {
				throw new InvalidData(`${path} is not a number`)
			}
			break
		case "string":
			if (typeof input !== "string") {
				throw new InvalidData(`${path} is not a string`)
			}
			break
		case "array": {
			if (!Array.isArray(input)) {
				throw new InvalidData(`${path} is not a array`)
			}
			for (let i = 0; i < input.length; i++) {
				validate(schema.props, input[i], `${path}[${i}]`)
			}
			break
		}
		case "object": {
			if (
				typeof input !== "object" || input === null || Array.isArray(input)
			) {
				throw new InvalidData(`${path} is not an object`)
			}
			for (const key in schema.props) {
				if (!Object.prototype.hasOwnProperty.call(input, key)) {
					throw new InvalidData(`${path} does not contain ${key}`)
				}
				// @ts-ignore
				validate(schema.props[key], input[key], `${path}.${key}`)
			}
		}
	}
}
