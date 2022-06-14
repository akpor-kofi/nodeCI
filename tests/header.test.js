const Page = require("./helpers/page");

let page;
beforeEach(async () => {
  page = await Page.build();

  await page.goto("http://localhost:3000");
});

afterEach(async () => {
  await page.close();
});

test("that the header has the correct test", async () => {
  const text = await page.getContentsOf("a.brand-logo");

  expect(text).toEqual("Blogster");
});

test("clicking login starts oauth flow", async () => {
  await page.click(".right a");

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test(" for logout button when signed in", async () => {
  // const id = '629e8523237738f47c1a587f';
  await page.login();

  const text = await page.getContentsOf("a[href='/auth/logout']");

  expect(text).toEqual("Logout");
});
