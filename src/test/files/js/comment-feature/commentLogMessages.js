const person = {
    fullName: 'John Doe',
    age: 25,
    address: {
        city: 'New York',
        state: 'NY'
    }
}

console.log("🚀 person", person);

const isMarried = true;

console.log("🍕 isMarried", isMarried);

function sayHello(person) {
    console.log("🦆 person:", person);
    console.log(`Hello ${person.fullName}`)
}
