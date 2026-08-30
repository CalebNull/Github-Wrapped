"use client"

import { useFormStatus } from "react-dom"
import React from "react"
import { Button } from "./ui/button"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Wrapping..." : "Wrap up GitHub!"}
    </Button>
  )
}

export const UsernameForm = ({
  action,
}: {
  action: (formData: FormData) => void
}) => {
  return (
    <form action={action} className="flex w-full flex-col gap-3">
      <input
        name="login"
        required
        autoComplete="off"
        autoCapitalize="off"
        spellCheck="false"
        placeholder="GitHub username"
        className="rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <SubmitButton />
    </form>
  )
}
