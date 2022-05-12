import { assertThrows } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { validate } from "./validator.ts"

Deno.test("validator", async (t) => {
	await t.step("number", () => {
		validate({ type: "number" }, 1)
		assertThrows(() => validate({ type: "number" }, "1"))
	})
	await t.step("string", () => {
		validate({ type: "string" }, "1")
		assertThrows(() => validate({ type: "string" }, 1))
	})
	await t.step("array", () => {
		validate({ type: "array", props: { type: "number" } }, [1, 2])
		assertThrows(() => validate({ type: "array", props: { type: "number" } }, [1, "2"]))
	})
	await t.step("object", () => {
		validate({
			type: "object",
			props: { key1: { type: "number" }, key2: { type: "string" } },
		}, { key1: 1, key2: "1" })
		assertThrows(() =>
			validate({
				type: "object",
				props: { key1: { type: "number" }, key2: { type: "string" } },
			}, { key1: "1", key2: 1 })
		)
		assertThrows(() =>
			validate({
				type: "object",
				props: { key1: { type: "number" }, key2: { type: "string" } },
			}, { key1: 1 })
		)
	})
})
