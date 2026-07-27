import * as React from "react"

/**
 * `false` durante el render del servidor y la primera pasada de hidratación;
 * `true` en cuanto React ya controla el DOM en el cliente.
 *
 * Sirve para no ofrecer acciones que dependen enteramente de JS antes de que
 * JS pueda interceptarlas. Caso concreto en esta web: los formularios de
 * contacto y boletín no tienen `action`, así que un submit nativo previo a la
 * hidratación recarga la página y pierde el mensaje sin avisar; el botón de
 * envío se mantiene deshabilitado hasta que esto devuelve `true`.
 *
 * Se usa `useSyncExternalStore` en lugar de `useState` + `useEffect` porque es
 * el patrón que React prevé para diferenciar servidor de cliente sin provocar
 * un render en cascada (la regla `react-hooks/set-state-in-effect` del repo
 * rechaza la versión con efecto).
 */

/** El valor nunca cambia tras hidratar, así que no hay a qué suscribirse. */
const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export function useHydrated(): boolean {
  return React.useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
