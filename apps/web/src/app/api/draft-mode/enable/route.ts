import {defineEnableDraftMode} from 'next-sanity/draft-mode'
import {client} from '@/sanity/client'

/** Opened by the Writing Room's Preview: checks the Studio's one-hour secret, then shows drafts. */
export const {GET} = defineEnableDraftMode({
  client: client.withConfig({token: process.env.SANITY_API_READ_TOKEN}),
})
