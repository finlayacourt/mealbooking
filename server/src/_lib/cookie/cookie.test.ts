import { assertEquals, assertObjectMatch } from "https://deno.land/std@0.126.0/testing/asserts.ts"
import { parse_cookie, serialize_cookie } from "./cookie.ts"

Deno.test("parse_cookie", async (t) => {
	await t.step("basic", () => {
		assertObjectMatch(
			parse_cookie("foo=bar"),
			{ foo: "bar" },
		)
	})
	await t.step("ignore spaces", () => {
		assertObjectMatch(
			parse_cookie("foo   = bar; dee    =  dar"),
			{ foo: "bar", dee: "dar" },
		)
	})
})

Deno.test("serialize_cookie", async (t) => {
	await t.step("basic", () => {
		assertEquals(
			serialize_cookie("foo", "bar"),
			"foo=bar",
		)
	})
	await t.step("path", () => {
		assertEquals(
			serialize_cookie("foo", "bar", { path: "/" }),
			"foo=bar; Path=/",
		)
	})
	await t.step("secure", () => {
		assertEquals(
			serialize_cookie("foo", "bar", { secure: true }),
			"foo=bar; Secure",
		)
	})
	await t.step("domain", () => {
		assertEquals(
			serialize_cookie("foo", "bar", { domain: "example.com" }),
			"foo=bar; Domain=example.com",
		)
	})
	await t.step("max-age", () => {
		assertEquals(
			serialize_cookie("foo", "bar", { max_age: 1000 }),
			"foo=bar; Max-Age=1000",
		)
	})
	await t.step("expires", () => {
		assertEquals(
			serialize_cookie("foo", "bar", {
				expires: new Date(2000, 11, 24, 10, 30, 59, 900),
			}),
			"foo=bar; Expires=Sun, 24 Dec 2000 10:30:59 GMT",
		)
	})
})
