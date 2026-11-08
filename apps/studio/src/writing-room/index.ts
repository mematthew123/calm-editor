import {ComposeIcon} from '@sanity/icons/Compose'
import {definePlugin} from 'sanity'
import {route} from 'sanity/router'
import {isWritingType} from '@calm/content'
import {TOOL_NAME, WRITE_INTENT} from './constants'
import {OpenInWritingRoomAction} from './OpenInWritingRoomAction'
import {RoomAwareNavbar} from './RoomAwareNavbar'
import {ROOM_ROUTES, roomState} from './room-route'
import {WritingRoomTool} from './WritingRoomTool'

/**
 * The Writing Room: a calm, full-screen space for writing a single Post or Case Study. It's a
 * Studio Tool rather than a custom input because only a Tool can take the whole screen; Details
 * stay in the standard document form. See DESIGN.md.
 */
export const writingRoom = definePlugin({
  name: 'calm-writing-room',
  tools: [
    {
      name: TOOL_NAME,
      title: 'Writing Room',
      icon: ComposeIcon,
      component: WritingRoomTool,
      router: route.create(
        '/',
        ROOM_ROUTES.map((path) => route.create(path)),
      ),
      canHandleIntent: (intent, params) => intent === WRITE_INTENT && isWritingType(params.type),
      getIntentState: (_intent, params) =>
        isWritingType(params.type) ? roomState(params.id, params.type) : {},
    },
  ],
  studio: {
    components: {
      navbar: RoomAwareNavbar,
    },
  },
  document: {
    actions: (prev, context) =>
      isWritingType(context.schemaType) ? [...prev, OpenInWritingRoomAction] : prev,
  },
})
