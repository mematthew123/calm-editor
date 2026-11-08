import {ComposeIcon} from '@sanity/icons/Compose'
import {definePlugin} from 'sanity'
import {route} from 'sanity/router'
import {TOOL_NAME, WRITE_INTENT} from './constants'
import {OpenInWritingRoomAction} from './OpenInWritingRoomAction'
import {RoomAwareNavbar} from './RoomAwareNavbar'
import {WritingRoomTool} from './WritingRoomTool'

/**
 * The Writing Room: a calm, full-screen space for writing a single Post.
 * See docs/adr/0001-writing-happens-in-a-dedicated-studio-tool.md and DESIGN.md.
 */
export const writingRoom = definePlugin({
  name: 'calm-writing-room',
  tools: [
    {
      name: TOOL_NAME,
      title: 'Writing Room',
      icon: ComposeIcon,
      component: WritingRoomTool,
      router: route.create('/', [route.create('/:postId')]),
      canHandleIntent: (intent, params) => intent === WRITE_INTENT && params.type === 'post',
      getIntentState: (_intent, params) => ({postId: params.id}),
    },
  ],
  studio: {
    components: {
      navbar: RoomAwareNavbar,
    },
  },
  document: {
    actions: (prev, context) =>
      context.schemaType === 'post' ? [...prev, OpenInWritingRoomAction] : prev,
  },
})
