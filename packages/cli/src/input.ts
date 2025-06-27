import { Effect } from 'effect'
import inquirer from 'inquirer'
import type { GameAction } from '@effect-deck/core'

export class PlayerInput {
  getPlayerAction(validActions: GameAction[]): Effect.Effect<GameAction> {
    return Effect.gen(function* () {
      const choices = validActions.map((action, index) => {
        switch (action.type) {
          case 'play_card':
            return {
              name: `Play card: ${action.cardId}`,
              value: action,
            }
          case 'end_turn':
            return {
              name: 'End turn',
              value: action,
            }
          case 'start_game':
            return {
              name: 'Start new game',
              value: action,
            }
          default:
            return {
              name: 'Unknown action',
              value: action,
            }
        }
      })

      const { selectedAction } = yield* Effect.promise(() =>
        inquirer.prompt([
          {
            type: 'list',
            name: 'selectedAction',
            message: 'Choose your action:',
            choices,
          },
        ])
      )

      return selectedAction as GameAction
    })
  }
}