// |: initial cursor position
// @: expected console.log() location
// +: works as expected
// -: broken

//+    |
const foo = bar();
// @

//+          |
foo.forEach((x) => foo(x));
//                 { @ }

//+          |
foo.forEach((x) => {
  // @
  foo(x);
});

//+     |
const data = useSWR('index/partners', () => sdk.partners());
// @

//+                |
const { data: partners } = useSWR('index/partners', () => sdk.partners());
// @

//+
function readJsonFile(file) {
  // |@
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
