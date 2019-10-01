# Wrap Chain
A chain class that can be instantiated or used statically.

Each "Link" member in the chain has a `pre` and `post` callback that runs before and after the next link in the chain.

The `run` method initiates the chain and must be called to start execution.

The `run` method returns a Promise and can therefore be used as the start of another promise chain if you're feeling crazy.

## Examples

``` javascript
await chain.link(
    ()=>console.log(`before`), 
    ()=>console.log(`after`))
    .run(()=>console.log(`mid`));
```
Prints `before`, `mid`, `after`. In that order.

``` javascript
await new chain().link(
        ()=>new Promise(resolve => setTimeout(resolve, 2000)))
    ).run(()=>console.log(`I waited`))
```
Prints `I waited` after pausing for 2 seconds.


## Notes
This class is meant to be extended. For my specific use case, I use it in mocha tests to connect to MongoDB, run a database operation, and disconnect after completion.

### Ex.
``` javascript
class mongo_wrapper extends chain {
    get mongo(){
        constructor(){super()}

        return this.link(
            async () => {
                await MongoClient.connect(URI)
            }, 
            async () => {
                await MongoClient.close()
            })
    }
}

await mongo_wrapper.link(
    ()=>console.log(`connecting`), 
    ()=>console.log(`disconnected`))
    .mongo
    .run(()=>MongoClient.collection(`test`).find({}))

```