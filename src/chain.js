module.exports = class chain {
    constructor() {
        this._chain = async cb => {
            if (cb) {
                let err = undefined
                let data = undefined
                if (cb.constructor.name === `AsyncFunction`)
                    await cb()
                        .then(d => {
                            data = d
                        })
                        .catch(e => {
                            err = e
                        })
                else if (cb.constructor.name === `Function`)
                    try {
                        data = cb()
                    } catch (e) {
                        err = e
                    }
                else throw new Error(`cb is not an instance of a Function`)

                if (err) throw err
                return data
            }
        }
    }

    async run(cb = () => {}) {
        if (![`Function`, `AsyncFunction`].includes(cb.constructor.name))
            throw new Error(`cb must be an instance of a function`)
        return this._chain(cb) // Execute the chain with final callback
    }
    static async run(cb) {
        return new chain().run(cb)
    }

    /**
     * Runs custom middleware for chain
     * @param {Function} before_cb runs before evaluating the rest of the chain
     * @param {Function} after_cb runs after evaluating the rest of the chain
     */
    link(before_cb, after_cb) {
        let previous_chain_item = this._chain // backup old chain
        this._chain = async next_chain_item =>
            await previous_chain_item(async () => {
                /** BEFORE FINAL CALL */
                if (before_cb) {
                    if (before_cb.constructor.name === `AsyncFunction`)
                        await before_cb()
                    if (before_cb.constructor.name === `Function`) before_cb()
                }

                /** BEFORE FINAL CALL END*/

                let err = undefined
                let data = undefined
                if (next_chain_item.constructor.name === `AsyncFunction`)
                    await next_chain_item()
                        .then(d => {
                            data = d
                        })
                        .catch(e => {
                            err = e
                        })
                if (next_chain_item.constructor.name === `Function`)
                    try {
                        data = next_chain_item()
                    } catch (e) {
                        err = e
                    }

                /** AFTER FINAL CALL */
                if (after_cb) {
                    if (after_cb.constructor.name === `AsyncFunction`)
                        await after_cb()
                    if (after_cb.constructor.name === `Function`) after_cb()
                }

                /** AFTER FINAL CALL END*/

                if (err) throw err
                return data
            })

        return this
    }
    static link(before_cb, after_cb) {
        return new chain().link(before_cb, after_cb)
    }
}
