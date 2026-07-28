/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    session: import('./server/session.js').Session;
  }
}
