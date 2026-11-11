import type { ComponentProps } from 'react';
export function FieldGroup(props: ComponentProps<'div'>) { return <div {...props} className={`field-group ${props.className || ''}`} />; }
export function Field(props: ComponentProps<'div'>) { return <div {...props} className={`field ${props.className || ''}`} />; }
export function FieldLabel(props: ComponentProps<'label'>) { return <label {...props} className={`field-label ${props.className || ''}`} />; }
export function FieldSet(props: ComponentProps<'fieldset'>) { return <fieldset {...props} className={`field-set ${props.className || ''}`} />; }
export function FieldLegend(props: ComponentProps<'legend'>) { return <legend {...props} className={`field-label ${props.className || ''}`} />; }
export function FieldDescription(props: ComponentProps<'p'>) { return <p {...props} className={`field-description ${props.className || ''}`} />; }
