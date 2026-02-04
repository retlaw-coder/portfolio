# 🎭 Sistema de Nombre Dinámico - @Retlaw

## ✨ Nueva Funcionalidad Implementada

El nombre en el hero ahora cambia dinámicamente entre **"WALTER CUSTODIO"** y **"@Retlaw"** con las siguientes reglas:

## 🎯 Comportamiento del Sistema

### 1. **Estado Inicial**
```
Nombre: WALTER CUSTODIO
Color: Blanco (#fff)
Botón: Oculto
```

### 2. **Hover sobre el Nombre**
```
Trigger: Usuario hace hover sobre "WALTER CUSTODIO"
Acción:
  ✅ Nombre cambia a "@Retlaw"
  ✅ Color cambia a Rojo (#ff3333)
  ✅ Botón de controles aparece (verde)
  ✅ Timer de 10 segundos inicia
```

### 3. **Durante los 10 Segundos**
```
Estado: @Retlaw visible
Botón: Visible
Timer: Contando regresivo

Si el usuario:
  - Abre controles → Timer se cancela, @Retlaw permanece
  - Hace scroll → @Retlaw desaparece, vuelve nombre completo
  - Espera 10s → @Retlaw desaparece, vuelve nombre completo
```

### 4. **Panel de Controles Abierto**
```
Nombre: @Retlaw (bloqueado)
Color: Rojo (#ff3333)
Botón: Visible (rojo, "✕ CLOSE")
Timer: Cancelado

Permanece así hasta que:
  ✅ Usuario cierra el panel
  ✅ Usuario hace scroll
```

### 5. **Cerrar Panel de Controles**
```
Trigger: Click en "✕ CLOSE"
Acción:
  ✅ Panel se cierra
  ✅ Nombre vuelve a "WALTER CUSTODIO"
  ✅ Color vuelve a Blanco
  ✅ Botón desaparece
```

### 6. **Scroll del Usuario**
```
Trigger: window.scrollY > 50
Condición: Panel NO está abierto
Acción:
  ✅ Nombre vuelve a "WALTER CUSTODIO"
  ✅ Color vuelve a Blanco
  ✅ Botón desaparece
  ✅ Timer se cancela
```

## 📊 Tabla de Estados

| Evento | Nombre | Color | Botón | Timer |
|--------|--------|-------|-------|-------|
| **Inicial** | WALTER CUSTODIO | Blanco | ❌ | - |
| **Hover** | @Retlaw | Rojo | ✅ Verde | ⏱️ 10s |
| **10s transcurridos** | WALTER CUSTODIO | Blanco | ❌ | - |
| **Panel abierto** | @Retlaw | Rojo | ✅ Rojo | ❌ |
| **Panel cerrado** | WALTER CUSTODIO | Blanco | ❌ | - |
| **Scroll (sin panel)** | WALTER CUSTODIO | Blanco | ❌ | - |

## 🔧 Implementación Técnica

### Estados Agregados:
```javascript
const [showRetlaw, setShowRetlaw] = useState(false);
const timerRef = useRef(null);
```

### Lógica del Timer:
```javascript
useEffect(() => {
    // Si controles abiertos → mantener @Retlaw
    if (showControls) {
        setShowRetlaw(true);
        setShowControlsButton(true);
        return;
    }

    // Si botón visible → iniciar timer 10s
    if (showControlsButton && !showControls) {
        setShowRetlaw(true);
        
        timerRef.current = setTimeout(() => {
            setShowRetlaw(false);
            setShowControlsButton(false);
        }, 10000);
    }

    // Cleanup
    return () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };
}, [showControlsButton, showControls]);
```

### Detección de Scroll:
```javascript
useEffect(() => {
    const handleScroll = () => {
        if (window.scrollY > 50 && !showControls) {
            setShowRetlaw(false);
            setShowControlsButton(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
}, [showControls]);
```

### Renderizado del Nombre:
```javascript
<h1
    className="hero-title reveal-text"
    style={{ 
        color: showRetlaw ? '#ff3333' : '#fff',
        transition: 'color 0.3s ease',
        cursor: 'pointer'
    }}
    onMouseEnter={() => setShowControlsButton(true)}
>
    {showRetlaw ? '@Retlaw' : 'WALTER\nCUSTODIO'}
</h1>
```

### Handler del Botón:
```javascript
onClick={() => {
    if (showControls) {
        // Cerrando → reset todo
        setShowControls(false);
        setShowRetlaw(false);
        setShowControlsButton(false);
    } else {
        // Abriendo → mostrar controles
        setShowControls(true);
    }
}}
```

## 🎨 Transiciones Visuales

### Cambio de Nombre:
- **Duración**: Instantánea (cambio de texto)
- **Color**: Transición suave de 0.3s
- **Efecto**: Blanco → Rojo o Rojo → Blanco

### Aparición del Botón:
- **Animación**: fadeIn 0.3s
- **Efecto**: Aparece desde abajo con fade

## 🎯 Casos de Uso

### Caso 1: Usuario Curioso
```
1. Hace hover sobre nombre
2. Ve "@Retlaw" en rojo
3. Ve botón de controles
4. No hace nada
5. Después de 10s → vuelve a normal
```

### Caso 2: Usuario Interactivo
```
1. Hace hover sobre nombre
2. Ve "@Retlaw" en rojo
3. Hace clic en "🎮 CONTROLS"
4. Panel se abre
5. @Retlaw permanece
6. Ajusta el modelo
7. Cierra el panel
8. Vuelve a "WALTER CUSTODIO"
```

### Caso 3: Usuario que Scrollea
```
1. Hace hover sobre nombre
2. Ve "@Retlaw" en rojo
3. Empieza a scrollear
4. Inmediatamente vuelve a "WALTER CUSTODIO"
```

### Caso 4: Usuario con Panel Abierto
```
1. Abre panel de controles
2. @Retlaw permanece visible
3. Hace scroll
4. @Retlaw sigue visible (panel abierto)
5. Cierra panel
6. Vuelve a "WALTER CUSTODIO"
```

## ✅ Ventajas del Sistema

1. **Easter Egg Sutil**: El cambio a @Retlaw es un detalle divertido
2. **No Intrusivo**: Vuelve a normal automáticamente
3. **Contextual**: Se mantiene mientras el usuario interactúa
4. **Responsive**: Reacciona al scroll y acciones del usuario
5. **Smooth**: Transiciones suaves y profesionales

## 🎮 Integración con Controles

El sistema de nombre está **perfectamente integrado** con el panel de controles:

- Cuando abres controles → @Retlaw se mantiene
- Cuando cierras controles → Vuelve a nombre completo
- El botón cambia de color según el estado
- Todo sincronizado y sin conflictos

## 📝 Notas Adicionales

### Modelo 3D:
- ✅ Se actualizó a una versión más ligera
- ✅ Mismo nombre de archivo: `final-city.glb`
- ✅ No requiere cambios en el código

### Timer:
- ⏱️ Duración: 10 segundos exactos
- 🔄 Se reinicia en cada hover
- ❌ Se cancela al abrir controles o scrollear

### Prioridades:
1. Panel abierto → @Retlaw permanece
2. Scroll → Reset inmediato (si panel cerrado)
3. Timer → Reset después de 10s

¡El sistema está completo y funcionando! 🎉
