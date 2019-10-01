const { expect } = require(`chai`)

const chain = require(`../src/chain`)

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function run_tests(get_chain) {
    it(`should add wrap "run" in "link" callbacks`, async function() {
        this.slow(750)

        let result = []
        await get_chain()
            .link(async () => result.push(1), async () => result.push(3))
            .run(async () => {
                await timeout(250)
                result.push(2)
            })

        expect(result).to.eql([1, 2, 3])
    })

    it(`should allow multiple links`, async function() {
        this.slow(500)

        let result = []
        await get_chain()
            .link(
                async () => result.push(1),
                async () => {
                    await timeout(100)
                    result.push(5)
                }
            )
            .link(async () => result.push(2), async () => result.push(4))
            .run(async () => result.push(3))

        expect(result).to.eql([1, 2, 3, 4, 5])
    })

    it(`should allow mixing sync and async links`, async function() {
        this.slow(500)

        let result = []
        await get_chain()
            .link(
                async () => result.push(1),
                async () => {
                    await timeout(100)
                    result.push(5)
                }
            )
            .link(() => result.push(2), () => result.push(4))
            .run(async () => result.push(3))

        expect(result).to.eql([1, 2, 3, 4, 5])
    })

    it(`should handle errors in final callback`, async function() {
        let result = []
        let err = await get_chain()
            .run(() => {
                return Promise.reject(new Error(`ok`))
            })
            .catch(e => e)

        expect(err.message).to.eql(`ok`)
    })

    it(`should return data from "run"`, async function() {
        let good = await get_chain().run(() => {
            return true
        })

        expect(good).to.equal(true)
    })

    it(`should allow undefined to be passed to run`, async function() {
        await get_chain().run()
    })

    it(`should allow mutating during chain`, async function() {
        let result = { done: false }
        await get_chain()
            .link(async () => {
                await timeout(250)
                result.done = true
            })
            .run()

        expect(result.done).to.equal(true)
    })

    it(`should return the results of "run" through links`, async function() {
        let good = await get_chain()
            .link(async () => {
                await timeout(250)
            })
            .run(() => true)

        expect(good).to.equal(true)
    })

    it(`should handle error in async "run"`, async function() {
        let err = await get_chain()
            .run(async () => {
                throw new Error(`TEST ERROR`)
            })
            .catch(e => e)

        expect(err.message).to.equal(`TEST ERROR`)
    })

    it(`should handle error in synchronous "run"`, async function() {
        let err = await get_chain()
            .run(() => {
                throw new Error(`TEST ERROR`)
            })
            .catch(e => e)

        expect(err.message).to.equal(`TEST ERROR`)
    })

    it(`should throw error "run" cb is not an instance of a Function`, async function() {
        let err = await get_chain()
            .run(2)
            .catch(e => e)

        expect(err.message).to.equal(`cb must be an instance of a function`)
    })

    it(`should pass errors through links Synchronously`, async function() {
        let err = await get_chain()
            .link()
            .run(() => {
                throw new Error(`TEST ERROR`)
            })
            .catch(e => e)

        expect(err.message).to.equal(`TEST ERROR`)
    })

    it(`should pass errors through links Asynchronously`, async function() {
        let err = await get_chain()
            .link()
            .run(async () => {
                throw new Error(`TEST ERROR`)
            })
            .catch(e => e)

        expect(err.message).to.equal(`TEST ERROR`)
    })

    it(`should allow undefined cb`, async function() {
        await get_chain()
            .link()
            .run(undefined)
    })
}

describe(`Chain Class`, function() {
    describe(`Instance`, function() {
        it(`should create and instance of the "chain" object`, function() {
            let obj = new chain()
            expect(obj).to.be.an.instanceof(chain)
        })

        // eslint-disable-next-line mocha/no-setup-in-describe
        run_tests(() => new chain())
    })

    describe(`Static`, function() {
        it(`should allow calling run as static member`, function() {
            let result = ``
            chain.run(() => (result += 0))
            expect(result).to.equal(`0`)
        })

        // eslint-disable-next-line mocha/no-setup-in-describe
        run_tests(() => chain)
    })
})
