<script>
  import { auth } from '$lib/trading/supabase.js'

  async function onSubmit(e) {
    const email = e.target.elements["email"].value;
    const password = e.target.elements["password"].value;

    const response = await auth.signUp({
      email, password
    })

    console.log({response})

    window.location.href = "/trading"
  }
</script>


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