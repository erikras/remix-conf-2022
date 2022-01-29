# Backend XState Machines on Remix

This is a _rough_ proof of concept RFC for a potential talk at Remix Conf 2022.

You've been invited to see it because you are experts on parts of the tech used. Feedback more than welcome! 🙏 (Maybe through twitter DM or issue or PR?)

## Features

- Context is maintained, incrementing a `transitions` value every time the machine transitions to a new state.
- Refresh works
- If you go to the root route, it will forward you to where the machine from the cookie thinks you should be
- Back and Forward browser buttons work
- Oh, and it works with JS disabled! 😎

## Limitations

- In order for the back and forward browser buttons to work, I had to disable caching, to force the `loader()` to run. 😢

## How it works

### Async Interpret

This is the real trick to getting XState to work on the backend. You have to instantiate (interpret) a machine, subscribe to it, potentially send an event to start things moving, and then wait for a "done" state, timing out otherwise.

I can't use `{ type: 'final' }` from the XState API to mark states as "done", because then XState will shut down the machine before I can send my `initialEvent`. Because, sort of by definition, all rehydrated machines are already in a "done" state from the last time they ran on the server.

To solve this, I've placed a `meta: { done: true }` on the states that are "done" states. Keep in mind that not all states will be "done" when it starts to need async "loading" states.

It would be awesome if there were first party support for this in XState.

### Root Route

#### Loader

- Checks if there's an existing machine saved in the cookie
  - If there is, it forwards the user to the route for the current state
- If no cookie – we're starting fresh – it boots up the machine, and waits for it to settle onto a "done" state, and:
  - Saves the machine to a cookie
  - Forwards the user to the "initial" route

### State Route

#### Loader

- If there's not a machine in a cookie, it redirects to Root Route
- If the route matches the current machine state, it returns the machine state
- If the current route does not match the current route in the machine from the cookie, it sends a `GOTO` event to the machine to send it to the state that matches the route.
  - This, and disabling browser caching 😢, is what allows the Back/Forward browser buttons to work

#### Action

Here's where the fun stuff happens!

- It finds the machine from the cookie
  - If the cookie has been erased for some reason, it bails out to the Root Route
- It gets the event to send from the `formData`
- It instantiates the machine with the state from the cookie and sends the event.
- If the new state is the same as the previous state (very common in XState), saves the new machine state as a cookie
- If the new state is different, it redirects to that url and saves the new machine state as a cookie

---

Thanks! ❤️ – [@erikras](https://twitter.com/erikras)
