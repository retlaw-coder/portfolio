# 🎮 Panel de Control 3D - Guía Rápida

## ✨ ¡Nuevo! Control en Tiempo Real

Ahora puedes ajustar la posición, rotación y escala de tu modelo 3D **sin recargar la página**.

## 🚀 Cómo Usar

1. **Abre tu portfolio** en el navegador (http://localhost:5173/portfolio/)

2. **Haz clic en el botón verde** "🎮 CONTROLS" en la esquina inferior derecha

3. **Mueve los sliders** para ajustar el modelo en tiempo real:
   - **📍 POSITION**: Mueve el modelo en el espacio 3D
     - X: Izquierda (-) / Derecha (+)
     - Y: Abajo (-) / Arriba (+)
     - Z: Atrás (-) / Adelante (+)
   
   - **🔄 ROTATION**: Rota el modelo
     - X: Inclinar adelante/atrás
     - Y: Girar izquierda/derecha
     - Z: Inclinar lateral
   
   - **📏 SCALE**: Cambia el tamaño del modelo

4. **Copia los valores** cuando encuentres la posición perfecta:
   - Haz clic en "📋 COPY VALUES"
   - Los valores se copian al portapapeles

5. **Pega los valores** en `src/components/Hero.jsx` (líneas 57-59)

6. **Cierra el panel** cuando termines (botón "✕ CLOSE")

## 🎯 Botones del Panel

| Botón | Función |
|-------|---------|
| **📋 COPY VALUES** | Copia el código con los valores actuales |
| **🔄 RESET** | Vuelve a los valores por defecto |
| **✕ CLOSE** | Cierra el panel de control |

## 💡 Tips

- Los cambios son **instantáneos** - no necesitas recargar
- Usa **COPY VALUES** para guardar la configuración que te guste
- El botón **RESET** vuelve a los valores originales
- El panel **no interfiere** con la navegación del portfolio

## 📝 Ejemplo de Uso

1. Abre el panel de control
2. Ajusta Position X a `3.0`
3. Ajusta Position Y a `-2.0`
4. Ajusta Rotation Y a `-5.0`
5. Haz clic en "📋 COPY VALUES"
6. Pega en tu código:

```javascript
model.position.set(3.00, -2.00, 0.00);
model.scale.set(0.065, 0.065, 0.065);
model.rotation.set(0.00, -5.00, 0.00);
```

## 🎨 Valores Actuales

Los valores iniciales están configurados en:
- **Position**: X=30, Y=-20, Z=0
- **Rotation**: X=0, Y=-5, Z=0
- **Scale**: 0.065

## 🔧 Rangos de los Sliders

| Control | Mínimo | Máximo |
|---------|--------|--------|
| Position X | -50 | 50 |
| Position Y | -50 | 50 |
| Position Z | -20 | 20 |
| Rotation X/Y/Z | -6.28 | 6.28 |
| Scale | 0.01 | 0.2 |

## ⚠️ Importante

- El panel de control es **solo para desarrollo**
- Cuando estés satisfecho con la posición, **copia los valores** y actualiza el código
- Puedes **eliminar el panel** más tarde si quieres (está en `Hero.jsx` líneas 148-350)

## 🗑️ Cómo Eliminar el Panel (Opcional)

Si quieres eliminar el panel de control después de encontrar la posición perfecta:

1. Abre `src/components/Hero.jsx`
2. Elimina las líneas 11-16 (estados)
3. Elimina las líneas 120-126 (useEffect de actualización)
4. Elimina las líneas 148-350 (UI del panel)
5. Reemplaza las líneas 57-59 con tus valores finales hardcodeados

¡Disfruta ajustando tu modelo 3D! 🎉
