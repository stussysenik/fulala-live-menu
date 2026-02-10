<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<svelte:head>
  <title>Admin Login - Fulala</title>
</svelte:head>

<div class="login-page">
  <div class="login-card">
    <h1 class="login-title">Fulala Admin</h1>
    <p class="login-subtitle">Enter password to continue</p>

    <form method="POST" use:enhance>
      {#if form?.error}
        <div class="error-message">{form.error}</div>
      {/if}

      <div class="field">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          autofocus
          autocomplete="current-password"
        />
      </div>

      <button type="submit" class="login-button">Sign In</button>
    </form>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: #FAFAF8;
    font-family: Inter, system-ui, sans-serif;
  }

  .login-card {
    width: 100%;
    max-width: 360px;
    padding: 2.5rem;
    background: white;
    border-radius: 0.75rem;
    border: 1px solid #E8E8E4;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  }

  .login-title {
    font-family: "Cormorant Garamond", Georgia, serif;
    font-size: 1.75rem;
    font-weight: 600;
    color: #2C2C2C;
    text-align: center;
    margin-bottom: 0.25rem;
  }

  .login-subtitle {
    text-align: center;
    font-size: 0.875rem;
    color: #6B6B6B;
    margin-bottom: 1.5rem;
  }

  .error-message {
    padding: 0.75rem;
    background: #FEF2F2;
    color: #DC2626;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  .field {
    margin-bottom: 1.25rem;
  }

  .field label {
    display: block;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #2C2C2C;
    margin-bottom: 0.375rem;
  }

  .field input {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid #E8E8E4;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-family: inherit;
    color: #2C2C2C;
    background: white;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
  }

  .field input:focus {
    outline: none;
    border-color: #C41E3A;
    box-shadow: 0 0 0 3px rgba(196, 30, 58, 0.1);
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background: #2C2C2C;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .login-button:hover {
    background: #1a1a1a;
  }

  .login-button:active {
    transform: scale(0.99);
  }
</style>
