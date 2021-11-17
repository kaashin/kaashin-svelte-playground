<script>
  import {user, auth} from '$lib/trading/supabase.js'

  let email;
  
  async function handleLogin  ()  {
    try {
      const { user, session, error } = await auth.signIn({ email })    
      if (error) throw error
      
      console.log({ user, session, error})

      window.location.href = "/trading"
    } catch (error) {
      console.error(error);
    } finally {
      //TODO: Do something!!
    }
  }

  async function onSubmit (e) {
    try {
      const { user, session, error } = await auth.signIn({
        email: e.target.elements["email"].value,
        password: e.target.elements["password"].value,
      })
      window.location.href = "/trading"
    } catch (error) {
      console.error(error);
    } finally {
      // TODO: Do something!!
    }
  }
</script>


  <h3>Login</h3>
  <div>
    <input type="email" placeholder="Your email" bind:value={email} />
    <button on:click={handleLogin}>Send Magic Link</button>
  </div>
  <hr />
  <form on:submit|preventDefault={onSubmit}>
    <div>
      <label>Email</label>
      <input type="email" name="email" />
    </div>
    <div>
      <label>Password</label>
      <input type="password" name="password" />
    </div>
    <button type="submit">Submit</button>
  </form>
