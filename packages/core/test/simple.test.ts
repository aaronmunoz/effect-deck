import { describe, it } from 'mocha'
import { expect } from 'chai'
import { Effect } from 'effect'

describe('Simple Test', () => {
  it('should run basic Effect program', async () => {
    const program = Effect.succeed(42)
    const result = await Effect.runPromise(program)
    expect(result).to.equal(42)
  })
})