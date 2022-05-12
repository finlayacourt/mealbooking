import { assert } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { clear_timeout, set_timeout } from "./timeout.ts"

Deno.test({
	name: "timeout",
	ignore: true,
	async fn(t) {
		await t.step("set_timeout", async (t) => {
			await t.step("basic", () =>
				new Promise((res) => {
					const start = Date.now()
					set_timeout(() => {
						const dt = Date.now() - start
						assert(1000 < dt && dt < 1100)
						res()
					}, 1000)
				}))
			await t.step("max", () =>
				new Promise((res) => {
					const start = Date.now()
					set_timeout(
						() => {
							const dt = Date.now() - start
							assert(2000 < dt && dt < 2100)
							res()
						},
						2000,
						undefined,
						500,
					)
				}))
		})
		await t.step("clear_timeout", async (t) => {
			await t.step("basic", () =>
				new Promise((res) => {
					const id = set_timeout(() => {
						throw new Error("timeout not cleared")
					}, 1000)
					setTimeout(() => clear_timeout(id), 500)
					setTimeout(res, 1500)
				}))
			await t.step("max", () =>
				new Promise((res) => {
					const id = set_timeout(
						() => {
							throw new Error("timeout not cleared")
						},
						2000,
						undefined,
						500,
					)
					setTimeout(() => clear_timeout(id), 1000)
					setTimeout(res, 2500)
				}))
		})
	},
})
