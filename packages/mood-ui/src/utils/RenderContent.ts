import { Fragment, h, type FunctionalComponent, type VNodeChild } from 'vue'
/** Render Vue content without adding a wrapper to the original component geometry. */
const RenderContent: FunctionalComponent<{ content?: VNodeChild }> = props => h(Fragment, [props.content])
export default RenderContent
