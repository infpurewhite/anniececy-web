/**
 * All reader-facing text, in English and Spanish, plus the source list.
 *
 * Editing rules:
 *   - every string is a pair made with t(english, spanish);
 *   - every factual claim lists the ids of the sources that support it;
 *   - every recommendation carries an evidence level: 'strong', 'moderate' or 'limited';
 *   - `npm test` checks that pairs are complete and that source ids resolve.
 *
 * Loaded as a classic script in the browser (exposes `window.CONTENT`) and as a
 * CommonJS module in the Node test suite.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.CONTENT = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /** Build an English/Spanish pair. */
  function t(en, es) {
    return { en: en, es: es };
  }

  var LANGUAGES = ['en', 'es'];
  var EVIDENCE_LEVELS = ['strong', 'moderate', 'limited'];

  /* ------------------------------------------------------------------ */
  /* Interface strings                                                   */
  /* ------------------------------------------------------------------ */

  var ui = {
    'meta.title': t(
      'In Phase · Understand your cycle, phase by phase',
      'En fase · Entiende tu ciclo, fase a fase'
    ),
    'meta.description': t(
      'A plain-language guide to the menstrual cycle in English and Spanish: what your hormones are doing, how mood can change, and what the evidence says about nutrition, exercise and productivity in each phase.',
      'Una guía clara sobre el ciclo menstrual, en español e inglés: qué hacen tus hormonas, cómo puede cambiar el ánimo y qué dice la evidencia sobre alimentación, ejercicio y productividad en cada fase.'
    ),
    'site.name': t('In Phase', 'En fase'),
    skip: t('Skip to content', 'Saltar al contenido'),
    'nav.label': t('Sections', 'Secciones'),
    'nav.today': t('Your cycle today', 'Tu ciclo hoy'),
    'nav.hormones': t('Hormones', 'Hormonas'),
    'nav.phases': t('Phases', 'Fases'),
    'nav.help': t('When to get help', 'Cuándo pedir ayuda'),
    'nav.sources': t('Sources', 'Fuentes'),
    'lang.label': t('Language', 'Idioma'),

    'hero.eyebrow': t(
      'A plain-language guide with evidence labels',
      'Una guía clara, con etiquetas de evidencia'
    ),
    'hero.title': t(
      'Understand your cycle, phase by phase',
      'Entiende tu ciclo, fase a fase'
    ),
    'hero.lead': t(
      'What your hormones are doing, how that can affect your mood and energy, and what is worth trying for food, movement and work in each phase. Every recommendation says how strong the research behind it is.',
      'Qué hacen tus hormonas, cómo pueden influir en tu ánimo y tu energía, y qué vale la pena probar en alimentación, movimiento y trabajo en cada fase. Cada recomendación indica qué tan sólida es la investigación que la respalda.'
    ),

    'tool.title': t('Where are you today?', '¿En qué fase estás hoy?'),
    'tool.lastStart': t('First day of your last period', 'Primer día de tu último periodo'),
    'tool.cycleLength': t('Cycle length (days)', 'Duración del ciclo (días)'),
    'tool.cycleHint': t(
      'From the first day of one period to the day before the next. Not sure? Use 28.',
      'Desde el primer día de un periodo hasta el día anterior al siguiente. ¿No lo sabes? Usa 28.'
    ),
    'tool.periodLength': t('Days of bleeding', 'Días de sangrado'),
    'tool.remember': t(
      'Remember this on this device',
      'Recordar estos datos en este dispositivo'
    ),
    'tool.submit': t('Show my phase', 'Ver mi fase'),
    'tool.forget': t('Forget my data', 'Borrar mis datos'),
    'tool.privacy': t(
      'Your dates never leave this browser. No account, no tracking, no cookies.',
      'Tus fechas nunca salen de este navegador. Sin cuenta, sin rastreo, sin cookies.'
    ),

    'err.date-required': t(
      'Enter the first day of your last period.',
      'Ingresa el primer día de tu último periodo.'
    ),
    'err.date-invalid': t('Enter a valid date.', 'Ingresa una fecha válida.'),
    'err.date-future': t(
      'That date is in the future. Enter today or an earlier date.',
      'Esa fecha está en el futuro. Ingresa la fecha de hoy o una anterior.'
    ),
    'err.cycle-range': t(
      'Enter a whole number from 21 to 35. Outside that range a calendar estimate is not reliable; see “If this guide does not fit you”.',
      'Ingresa un número entero entre 21 y 35. Fuera de ese rango la estimación por calendario no es confiable; consulta «Si esta guía no encaja contigo».'
    ),
    'err.period-range': t(
      'Enter a whole number from 2 to 8.',
      'Ingresa un número entero entre 2 y 8.'
    ),

    'result.example': t(
      'Example: a 28-day cycle with 5 days of bleeding',
      'Ejemplo: un ciclo de 28 días con 5 días de sangrado'
    ),
    'result.examplePrompt': t(
      'Enter your dates to see where you are today.',
      'Ingresa tus fechas para ver en qué punto estás hoy.'
    ),
    'result.yours': t('Your cycle today', 'Tu ciclo hoy'),
    'result.dayOf': t('Day {day} of {length}', 'Día {day} de {length}'),
    'result.estimated': t('estimated', 'estimación'),
    'result.next': t(
      'Next period expected in about {count} ({date}).',
      'Tu próximo periodo llegaría en unos {count} ({date}).'
    ),
    'unit.day.one': t('1 day', '1 día'),
    'unit.day.other': t('{n} days', '{n} días'),
    'result.projected': t(
      'The date you entered is more than one cycle old, so this assumes your periods have arrived on schedule since then. Update the date when your next period starts.',
      'La fecha que ingresaste es de hace más de un ciclo, así que esto supone que tus periodos llegaron puntuales desde entonces. Actualiza la fecha cuando empiece tu próximo periodo.'
    ),
    'result.todayTitle': t('What to expect today', 'Qué esperar hoy'),
    'result.readMore': t('Read the full section', 'Leer la sección completa'),
    'result.status': t(
      'Day {day} of {length}. {phase}, estimated. Next period expected in about {count}.',
      'Día {day} de {length}. {phase}, estimación. Tu próximo periodo llegaría en unos {count}.'
    ),
    'result.cleared': t(
      'Your data has been removed from this device.',
      'Tus datos se borraron de este dispositivo.'
    ),

    'cat.mood': t('Mood', 'Ánimo'),
    'cat.nutrition': t('Nutrition', 'Alimentación'),
    'cat.exercise': t('Exercise', 'Ejercicio'),
    'cat.productivity': t('Productivity', 'Productividad'),

    'wheel.aria': t(
      'A {length}-day cycle shown as a ring divided into phases.',
      'Un ciclo de {length} días representado como un anillo dividido en fases.'
    ),
    'wheel.ariaToday': t('Today is day {day}.', 'Hoy es el día {day}.'),
    'wheel.day': t('Day', 'Día'),
    'wheel.of': t('of {length}', 'de {length}'),
    'wheel.exampleUnit': t('day cycle', 'días de ciclo'),
    'wheel.today': t('Today', 'Hoy'),
    'legend.premenstrual': t('Premenstrual week', 'Semana premenstrual'),
    'days.range': t('Days {start}–{end}', 'Días {start}–{end}'),
    'days.single': t('Day {start}', 'Día {start}'),
    'days.none': t(
      'Not shown separately for this cycle length',
      'No se muestra por separado en un ciclo de esta duración'
    ),

    'hormones.title': t('What your hormones are doing', 'Qué hacen tus hormonas'),
    'chart.caption': t(
      'Illustrative sketch of relative hormone levels. It is not to scale and is not a measurement of your own hormones.',
      'Esquema ilustrativo de los niveles relativos de hormonas. No está a escala ni es una medición de tus propias hormonas.'
    ),
    'chart.aria': t(
      'Line chart of relative oestrogen and progesterone levels across the cycle. Oestrogen peaks just before ovulation and progesterone peaks in the second half. Use the left and right arrow keys to move through the days.',
      'Gráfico de líneas de los niveles relativos de estrógeno y progesterona a lo largo del ciclo. El estrógeno alcanza su máximo justo antes de la ovulación y la progesterona, en la segunda mitad. Usa las flechas izquierda y derecha para recorrer los días.'
    ),
    'chart.oestrogen': t('Oestrogen', 'Estrógeno'),
    'chart.progesterone': t('Progesterone', 'Progesterona'),
    'chart.ovulation': t('ovulation (estimated)', 'ovulación (estimada)'),
    'chart.today': t('Today', 'Hoy'),
    'chart.axis': t('Cycle day', 'Día del ciclo'),
    'chart.day': t('Day {day}', 'Día {day}'),
    'chart.tableSummary': t('Show this chart as a table', 'Ver este gráfico como tabla'),
    'chart.tablePhase': t('Phase', 'Fase'),
    'level.low': t('low', 'nivel bajo'),
    'level.rising': t('rising', 'subiendo'),
    'level.high': t('high', 'nivel alto'),
    'level.steady': t('steady', 'estable'),
    'explore.title': t('Explore a day', 'Explora un día'),
    'explore.hint': t(
      'Drag the slider, or press play to watch the cycle unfold.',
      'Mueve el control o pulsa reproducir para ver cómo avanza el ciclo.'
    ),
    'explore.slider': t('Cycle day to explore', 'Día del ciclo para explorar'),
    'explore.play': t('Play', 'Reproducir'),
    'explore.pause': t('Pause', 'Pausa'),
    'level.falling': t('falling', 'bajando'),

    'evidence.title': t('The short version', 'La versión corta'),
    'evidence.intro': t(
      'Much online advice about “syncing” food, training and work with your cycle goes further than the research does. This is what studies support so far.',
      'Muchos consejos en internet sobre «sincronizar» la comida, el entrenamiento y el trabajo con tu ciclo van más lejos que la investigación. Esto es lo que los estudios respaldan hasta ahora.'
    ),
    'key.title': t('How to read the labels', 'Cómo leer las etiquetas'),
    'key.intro': t(
      'Each recommendation below carries one of three labels.',
      'Cada recomendación de esta guía lleva una de estas tres etiquetas.'
    ),

    'phases.title': t('The four phases', 'Las cuatro fases'),
    'phases.introExample': t(
      'Day numbers are for a 28-day cycle. Enter your dates above to see your own.',
      'Los días corresponden a un ciclo de 28 días. Ingresa tus fechas arriba para ver los tuyos.'
    ),
    'phases.titleYours': t('Your phase now', 'Tu fase ahora'),
    'phases.introYours': t(
      'This is the guidance for where you are in your {length}-day cycle. The other phases open in their own window.',
      'Esta es la guía para el punto en que estás de tu ciclo de {length} días. Las otras fases se abren en su propia ventana.'
    ),
    'phases.othersTitle': t('The other phases', 'Las otras fases'),
    'phases.othersIntro': t(
      'Choose a phase to open its full guidance.',
      'Elige una fase para abrir su guía completa.'
    ),
    'phases.open': t('Open this phase', 'Abrir esta fase'),
    'dialog.close': t('Close', 'Cerrar'),
    'phases.nav': t('Jump to a phase', 'Ir a una fase'),
    'phase.happening': t('What is happening', 'Qué está pasando'),
    'phase.feel': t('How you may feel', 'Cómo puedes sentirte'),
    'phase.here': t('You are here', 'Estás aquí'),

    'basics.title': t('The basics, whatever the phase', 'Lo básico, sea cual sea la fase'),
    'basics.intro': t(
      'These have stronger evidence behind them than any phase-specific tip, so put them in place first.',
      'Esto tiene evidencia más sólida que cualquier consejo por fase, así que empieza por aquí.'
    ),

    'fit.title': t('If this guide does not fit you', 'Si esta guía no encaja contigo'),
    'fit.intro': t(
      'The four phases describe a natural cycle of 21 to 35 days. They are a poor fit in these situations.',
      'Las cuatro fases describen un ciclo natural de 21 a 35 días. En estas situaciones no encajan bien.'
    ),

    'help.title': t(
      'When to talk to a health professional',
      'Cuándo hablar con un profesional de la salud'
    ),
    'help.intro': t(
      'Painful, heavy or distressing periods are common, but that does not mean you have to put up with them. Book an appointment if any of these apply.',
      'Los periodos dolorosos, abundantes o que te angustian son frecuentes, pero eso no significa que tengas que aguantarlos. Pide una consulta si te pasa algo de esto.'
    ),
    'help.urgentTitle': t('Get help now', 'Busca ayuda ahora'),

    'sources.title': t('Sources', 'Fuentes'),
    'sources.intro': t(
      'Sources were last checked in November 2026. Research on the menstrual cycle is still thin in places; where studies disagree or are weak, this guide says so.',
      'Las fuentes se revisaron por última vez en noviembre de 2026. La investigación sobre el ciclo menstrual todavía es escasa en algunos puntos; cuando los estudios no coinciden o son débiles, esta guía lo indica.'
    ),
    'sources.cite': t('Source {n}', 'Fuente {n}'),
    'sources.guidance': t('Health service guidance', 'Guía de servicios de salud'),
    'sources.review': t('Review or guideline', 'Revisión o guía clínica'),
    'sources.study': t('Single study', 'Estudio individual'),

    'footer.disclaimer': t(
      'This page offers general information and is not medical advice. It does not replace a consultation with a health professional.',
      'Esta página ofrece información general y no es un consejo médico. No reemplaza la consulta con un profesional de la salud.'
    ),
    'footer.inclusive': t(
      'Written for women and for anyone who menstruates.',
      'Escrita para mujeres y para cualquier persona que menstrúa.'
    ),
    'footer.privacy': t(
      'This page makes no external requests and sets no cookies.',
      'Esta página no hace solicitudes externas ni usa cookies.'
    ),
    'footer.reviewed': t('Last reviewed: November 2026', 'Última revisión: noviembre de 2026')
  };

  /* ------------------------------------------------------------------ */
  /* Evidence labels                                                     */
  /* ------------------------------------------------------------------ */

  var evidence = {
    strong: {
      label: t('Strong evidence', 'Evidencia sólida'),
      description: t(
        'Consistent research findings, or guidelines built on them.',
        'Hallazgos consistentes de la investigación, o guías clínicas basadas en ellos.'
      )
    },
    moderate: {
      label: t('Moderate evidence', 'Evidencia moderada'),
      description: t(
        'Supported by reviews or health service advice, but effects are small, studies are low quality or results conflict.',
        'Respaldada por revisiones o por consejos de los servicios de salud, pero con efectos pequeños, estudios de baja calidad o resultados contradictorios.'
      )
    },
    limited: {
      label: t('Limited evidence', 'Evidencia limitada'),
      description: t(
        'Popular or plausible, with little direct research or no clear effect found. Something to try, not a rule.',
        'Popular o plausible, con poca investigación directa o sin un efecto claro. Algo para probar, no una regla.'
      )
    }
  };

  /* ------------------------------------------------------------------ */
  /* Notes shown with the phase calculator                               */
  /* ------------------------------------------------------------------ */

  var toolNotes = {
    estimate: {
      text: t(
        'This is a calendar estimate, not a measurement. Ovulation can move by several days from one cycle to the next, so do not use this to prevent or plan a pregnancy.',
        'Es una estimación por calendario, no una medición. La ovulación puede moverse varios días de un ciclo a otro, así que no uses esto para evitar ni para buscar un embarazo.'
      ),
      sources: ['nhsFertility', 'bull2019']
    },
    longPeriod: {
      text: t(
        'Bleeding for more than 7 days is worth mentioning to a health professional.',
        'Un sangrado de más de 7 días es algo que conviene comentar con un profesional de la salud.'
      ),
      sources: ['nhsIrregular']
    }
  };

  /* ------------------------------------------------------------------ */
  /* Hormones section                                                    */
  /* ------------------------------------------------------------------ */

  var hormones = {
    paragraphs: [
      {
        text: t(
          'A cycle runs from the first day of one period to the day before the next. The average is about 28 days, and anything from 21 to 35 days is normal.',
          'Un ciclo va desde el primer día de un periodo hasta el día anterior al siguiente. El promedio ronda los 28 días, y cualquier duración entre 21 y 35 días es normal.'
        ),
        sources: ['nhsFertility']
      },
      {
        text: t(
          'Two hormones do most of the work. Oestrogen rises through the first half and leads to ovulation, the release of an egg. Progesterone takes over in the second half. If there is no pregnancy, both fall and the next period begins.',
          'Dos hormonas hacen la mayor parte del trabajo. El estrógeno sube durante la primera mitad y conduce a la ovulación, es decir, la liberación de un óvulo. La progesterona toma el relevo en la segunda mitad. Si no hay embarazo, ambas bajan y comienza el siguiente periodo.'
        ),
        sources: ['nhsFertility', 'statpearls']
      },
      {
        text: t(
          'Biologically there are two phases, follicular and luteal, divided by ovulation. This guide uses the popular four-part view because it is easier to follow. The first half is the part that varies most in length. The second half is steadier at around two weeks, although it also differs between people.',
          'Biológicamente hay dos fases, la folicular y la lútea, separadas por la ovulación. Esta guía usa la división popular en cuatro partes porque es más fácil de seguir. La primera mitad es la que más varía en duración. La segunda es más estable, de unas dos semanas, aunque también cambia entre personas.'
        ),
        sources: ['statpearls', 'bull2019']
      }
    ],
    table: [
      {
        phase: 'menstrual',
        oestrogen: t(
          'Low; in short cycles it can start to rise before bleeding ends',
          'Bajo; en ciclos cortos puede empezar a subir antes de que termine el sangrado'
        ),
        progesterone: t('Low', 'Baja')
      },
      {
        phase: 'follicular',
        oestrogen: t(
          'Low for a few days, then rises quickly towards ovulation',
          'Bajo durante unos días y luego sube con rapidez hacia la ovulación'
        ),
        progesterone: t('Low', 'Baja')
      },
      {
        phase: 'ovulatory',
        oestrogen: t('Peaks just before ovulation, then dips', 'Llega a su máximo justo antes de la ovulación y luego baja'),
        progesterone: t('Starts to rise', 'Empieza a subir')
      },
      {
        phase: 'luteal',
        oestrogen: t(
          'Rises again to a second, smaller peak mid-phase, then falls before the next period',
          'Vuelve a subir hasta un segundo pico, más pequeño, a mitad de la fase y luego baja antes del siguiente periodo'
        ),
        progesterone: t('Rises to its peak, then falls before the next period', 'Sube hasta su máximo y luego baja antes del siguiente periodo')
      }
    ]
  };

  /* ------------------------------------------------------------------ */
  /* "The short version": what research supports overall                 */
  /* ------------------------------------------------------------------ */

  var findings = [
    {
      icon: 'mood',
      title: t('Mood: real, and very individual', 'Ánimo: real y muy individual'),
      text: t(
        'In app records from more than 3 million women in 109 countries, most measures of mood varied more across the menstrual cycle than across the day, the week or the seasons. Yet a review of 47 studies using daily mood diaries found no clear evidence of one premenstrual mood pattern in women in general. A minority have symptoms severe enough to need treatment.',
        'En registros de una aplicación con más de 3 millones de mujeres de 109 países, la mayoría de las medidas del ánimo variaron más a lo largo del ciclo menstrual que a lo largo del día, de la semana o de las estaciones. Sin embargo, una revisión de 47 estudios con diarios de ánimo no encontró evidencia clara de un único patrón premenstrual en las mujeres en general. Una minoría tiene síntomas lo bastante intensos como para necesitar tratamiento.'
      ),
      sources: ['pierson2021', 'romans2012', 'reilly2024']
    },
    {
      icon: 'exercise',
      title: t('Exercise: train by how you feel', 'Ejercicio: entrena según cómo te sientas'),
      text: t(
        'A meta-analysis of 78 studies found that performance may dip very slightly in the first days of the period. The evidence was low quality, and the authors concluded that no general rules can be set. A 2023 review of reviews found no clear effect of cycle phase on strength or on gains from training.',
        'Un metaanálisis de 78 estudios encontró que el rendimiento puede bajar muy levemente en los primeros días del periodo. La evidencia era de baja calidad y los autores concluyeron que no se pueden fijar reglas generales. Una revisión de revisiones de 2023 no halló un efecto claro de la fase del ciclo sobre la fuerza ni sobre los progresos del entrenamiento.'
      ),
      sources: ['mcnulty2020', 'colenso2023']
    },
    {
      icon: 'productivity',
      title: t('Thinking: no measurable change', 'Capacidad mental: sin cambios medibles'),
      text: t(
        'A 2025 meta-analysis of 102 studies and almost 4,000 participants found no robust evidence that attention, executive function, creativity, or spatial or verbal ability change across the cycle. How you feel can change. What you are capable of does not appear to.',
        'Un metaanálisis de 2025 con 102 estudios y casi 4000 participantes no encontró evidencia sólida de que la atención, las funciones ejecutivas, la creatividad ni la capacidad espacial o verbal cambien a lo largo del ciclo. Puede cambiar cómo te sientes. Lo que eres capaz de hacer, al parecer, no.'
      ),
      sources: ['jang2025']
    },
    {
      icon: 'nutrition',
      title: t(
        'Appetite: a little higher before your period',
        'Apetito: un poco mayor antes del periodo'
      ),
      text: t(
        'Pooled studies show people eat more in the second half of the cycle, by roughly 170 kcal a day on average, and resting metabolism may be slightly higher too. The studies are small and their methods are inconsistent.',
        'Los estudios combinados muestran que se come más en la segunda mitad del ciclo, unas 170 kcal diarias más en promedio, y que el metabolismo en reposo también podría ser algo mayor. Son estudios pequeños y con métodos poco uniformes.'
      ),
      sources: ['tucker2025', 'benton2020']
    }
  ];

  /* ------------------------------------------------------------------ */
  /* The four phases                                                     */
  /* ------------------------------------------------------------------ */

  var phases = [
    {
      id: 'menstrual',
      name: t('Menstrual phase', 'Fase menstrual'),
      short: t('Menstrual', 'Menstrual'),
      tagline: t(
        'Your period: hormones at their lowest',
        'Tu periodo: las hormonas en su punto más bajo'
      ),
      happening: {
        text: t(
          'Day 1 is the first day of bleeding. Oestrogen and progesterone have fallen, and the lining of the womb comes away as your period, which usually lasts 2 to 7 days.',
          'El día 1 es el primer día de sangrado. El estrógeno y la progesterona han bajado, y el revestimiento del útero se desprende en forma de periodo, que suele durar de 2 a 7 días.'
        ),
        sources: ['nhsFertility']
      },
      feel: {
        text: t(
          'Cramps are common in the first days, and you may feel more tired. Heat (a heat pad, a hot water bottle or a warm bath) and gentle movement help many people. If you had premenstrual symptoms, they usually ease within a few days of bleeding starting.',
          'Los cólicos son frecuentes en los primeros días y puede que te sientas más cansada. El calor (una almohadilla térmica, una bolsa de agua caliente o un baño tibio) y el movimiento suave ayudan a muchas personas. Si tuviste síntomas premenstruales, suelen aliviarse a los pocos días de empezar el sangrado.'
        ),
        evidence: 'strong',
        sources: ['nhsPain', 'nhsPeriods']
      },
      nutrition: [
        {
          text: t(
            'Keep iron-rich foods in regular rotation: beans and chickpeas, dark green leafy vegetables, meat and dried fruit. Heavy periods are a very common cause of iron deficiency.',
            'Incluye con regularidad alimentos ricos en hierro: legumbres como frijoles y garbanzos, verduras de hoja verde oscura, carne y fruta deshidratada. Los periodos abundantes son una causa muy frecuente de falta de hierro.'
          ),
          evidence: 'strong',
          sources: ['nhsIron', 'munro2023']
        },
        {
          text: t(
            'Tea, coffee, milk and dairy can make iron harder to absorb. If your iron is low, avoid having them with iron-rich meals.',
            'El té, el café, la leche y los lácteos pueden dificultar la absorción del hierro. Si tienes el hierro bajo, evita tomarlos junto con las comidas ricas en hierro.'
          ),
          evidence: 'moderate',
          sources: ['nhsIron']
        },
        {
          text: t(
            'If you are often very tired and your periods are heavy, ask for a blood test before you start taking iron supplements.',
            'Si a menudo estás muy cansada y tus periodos son abundantes, pide un análisis de sangre antes de empezar a tomar suplementos de hierro.'
          ),
          evidence: 'strong',
          sources: ['nhsIron', 'munro2023']
        }
      ],
      exercise: [
        {
          text: t(
            'Movement can ease cramps: try walking, swimming, cycling or yoga. A Cochrane review found that regular exercise may reduce period pain substantially, although the trials were small and low quality.',
            'Moverte puede aliviar los cólicos: prueba caminar, nadar, andar en bicicleta o hacer yoga. Una revisión Cochrane encontró que el ejercicio regular puede reducir bastante el dolor menstrual, aunque los ensayos eran pequeños y de baja calidad.'
          ),
          evidence: 'moderate',
          sources: ['armour2019', 'nhsPain']
        },
        {
          text: t(
            'You do not need to skip training. On average, performance is only trivially lower in the first days of the period. Go lighter if you feel rough and train as normal if you feel fine.',
            'No hace falta que dejes de entrenar. En promedio, el rendimiento baja de forma mínima en los primeros días del periodo. Reduce la intensidad si te sientes mal y entrena con normalidad si te sientes bien.'
          ),
          evidence: 'moderate',
          sources: ['mcnulty2020']
        }
      ],
      productivity: [
        {
          text: t(
            'Your ability to think and concentrate does not measurably change during your period. What can change is comfort: pain and tiredness make the same work feel harder.',
            'Tu capacidad de pensar y concentrarte no cambia de forma medible durante el periodo. Lo que sí puede cambiar es la comodidad: con dolor y cansancio, el mismo trabajo cuesta más.'
          ),
          evidence: 'moderate',
          sources: ['jang2025']
        },
        {
          text: t(
            'If your first day or two are reliably hard, protect them where you can: fewer meetings, flexible hours, tasks that tolerate breaks. In a Dutch survey of 32,748 women, most said they had worked below their usual level during a period, and two in three wanted more flexibility.',
            'Si tu primer o segundo día suelen ser difíciles, protégelos cuando puedas: menos reuniones, horario flexible, tareas que permitan pausas. En una encuesta neerlandesa a 32 748 mujeres, la mayoría dijo haber rendido por debajo de su nivel habitual durante el periodo, y dos de cada tres querían más flexibilidad.'
          ),
          evidence: 'limited',
          sources: ['schoep2019']
        }
      ],
      today: {
        mood: t(
          'Cramps or tiredness are common. Premenstrual symptoms usually lift now.',
          'Los cólicos o el cansancio son frecuentes. Los síntomas premenstruales suelen ceder ahora.'
        ),
        nutrition: t(
          'Include iron-rich foods such as beans, leafy greens or meat.',
          'Incluye alimentos ricos en hierro, como legumbres, hojas verdes o carne.'
        ),
        exercise: t(
          'Gentle movement can ease cramps. Train as normal if you feel fine.',
          'El movimiento suave puede aliviar los cólicos. Entrena con normalidad si te sientes bien.'
        ),
        productivity: t(
          'Your thinking is unchanged. Plan around comfort if days 1 and 2 are hard.',
          'Tu capacidad mental no cambia. Organiza el día según tu comodidad si los días 1 y 2 son difíciles.'
        )
      }
    },
    {
      id: 'follicular',
      name: t('Follicular phase', 'Fase folicular'),
      short: t('Follicular', 'Folicular'),
      tagline: t(
        'After your period: oestrogen on the rise',
        'Después del periodo: el estrógeno en ascenso'
      ),
      happening: {
        text: t(
          'After bleeding stops, oestrogen stays low for a few days, then rises quickly as one follicle in the ovary takes the lead and its egg matures. Strictly, the follicular phase starts on day 1 and includes your period; here it means the days between bleeding and ovulation. This is the part of the cycle that varies most in length, which is why cycles differ from person to person and from month to month.',
          'Cuando termina el sangrado, el estrógeno se mantiene bajo unos días y luego sube con rapidez, a medida que un folículo del ovario toma la delantera y su óvulo madura. En rigor, la fase folicular empieza el día 1 e incluye el periodo; aquí nos referimos a los días entre el sangrado y la ovulación. Es la parte del ciclo que más varía en duración, y por eso los ciclos difieren entre personas y de un mes a otro.'
        ),
        sources: ['nhsFertility', 'statpearls', 'bull2019']
      },
      feel: {
        text: t(
          'Many people describe a steadier mood and more energy in these days, often because premenstrual and period symptoms have passed. Research has not shown a dependable high in this phase, so treat it as a common experience, not a guarantee.',
          'Muchas personas describen un ánimo más estable y más energía en estos días, a menudo porque ya pasaron los síntomas premenstruales y del periodo. La investigación no ha demostrado un «pico» confiable en esta fase, así que tómalo como una experiencia común, no como una garantía.'
        ),
        evidence: 'limited',
        sources: ['romans2012']
      },
      nutrition: [
        {
          text: t(
            'No diet is proven to suit this phase in particular. Appetite tends to be a little lower than in the second half of the cycle, so eat to your hunger and keep meals balanced.',
            'No hay una dieta demostrada para esta fase en particular. El apetito suele ser algo menor que en la segunda mitad del ciclo, así que come según tu hambre y mantén comidas equilibradas.'
          ),
          evidence: 'moderate',
          sources: ['tucker2025']
        },
        {
          text: t(
            'After a heavy period, keep up the iron-rich foods for the rest of the month.',
            'Después de un periodo abundante, mantén los alimentos ricos en hierro durante el resto del mes.'
          ),
          evidence: 'strong',
          sources: ['nhsIron']
        }
      ],
      exercise: [
        {
          text: t(
            'You may read that this is the window for heavy lifting and intense sessions. A 2023 review of reviews found no clear effect of cycle phase on strength or on gains from training, so a consistent programme matters more than timing.',
            'Quizá hayas leído que esta es la ventana ideal para levantar pesado y hacer sesiones intensas. Una revisión de revisiones de 2023 no halló un efecto claro de la fase del ciclo sobre la fuerza ni sobre los progresos del entrenamiento, así que importa más la constancia del programa que el momento.'
          ),
          evidence: 'moderate',
          sources: ['colenso2023']
        },
        {
          text: t(
            'If you do feel more energetic, use it. This is a good time for the sessions you enjoy pushing.',
            'Si de verdad te sientes con más energía, aprovéchala. Es buen momento para las sesiones en las que te gusta exigirte.'
          ),
          evidence: 'limited',
          sources: []
        }
      ],
      productivity: [
        {
          text: t(
            'Popular advice says to schedule demanding or creative work now. Studies do not show that thinking ability changes between phases, so this is about how you feel, not what you can do.',
            'El consejo popular dice que programes ahora el trabajo exigente o creativo. Los estudios no muestran que la capacidad mental cambie entre fases, así que se trata de cómo te sientes, no de lo que puedes hacer.'
          ),
          evidence: 'limited',
          sources: ['jang2025']
        },
        {
          text: t(
            'If your own notes show this is when you feel best, it is a sensible time for work that needs sustained effort.',
            'Si tus propios registros muestran que aquí es cuando mejor te sientes, es un momento razonable para el trabajo que exige esfuerzo sostenido.'
          ),
          evidence: 'limited',
          sources: []
        }
      ],
      today: {
        mood: t(
          'Often a steadier stretch, though not for everyone.',
          'Suele ser una etapa más estable, aunque no para todas las personas.'
        ),
        nutrition: t(
          'No special diet needed. Eat balanced meals to your hunger.',
          'No hace falta una dieta especial. Come equilibrado y según tu hambre.'
        ),
        exercise: t(
          'Train as planned. Consistency matters more than timing.',
          'Entrena según lo planeado. La constancia importa más que el momento.'
        ),
        productivity: t(
          'If you feel sharp, use it for work that needs sustained effort.',
          'Si te sientes despejada, aprovéchalo para el trabajo que exige esfuerzo sostenido.'
        )
      }
    },
    {
      id: 'ovulatory',
      name: t('Around ovulation', 'Alrededor de la ovulación'),
      short: t('Ovulation', 'Ovulación'),
      tagline: t(
        'Mid-cycle: oestrogen peaks and an egg is released',
        'Mitad del ciclo: el estrógeno llega a su máximo y se libera un óvulo'
      ),
      happening: {
        text: t(
          'Rising oestrogen sets off a surge of luteinising hormone (LH), and an ovary releases an egg. This usually happens around 10 to 16 days before the next period, but the exact day is hard to pinpoint.',
          'El aumento del estrógeno provoca un pico de hormona luteinizante (LH), y un ovario libera un óvulo. Suele ocurrir entre 10 y 16 días antes del siguiente periodo, pero el día exacto es difícil de precisar.'
        ),
        sources: ['statpearls', 'nhsFertility']
      },
      feel: {
        text: t(
          'Some people notice a brief twinge on one or both sides of the lower tummy, or clearer, slippery discharge that looks like raw egg white. Many notice nothing. Claims of a peak in mood or confidence are common online but are not established.',
          'Algunas personas notan una punzada breve en uno o ambos lados del bajo vientre, o un flujo más claro y resbaladizo, parecido a la clara de huevo cruda. Muchas no notan nada. En internet abundan las afirmaciones sobre un pico de ánimo o de confianza, pero no están demostradas.'
        ),
        evidence: 'limited',
        sources: ['uhbFertility']
      },
      note: {
        text: t(
          'Pregnancy is possible in the days around ovulation. A date-based estimate like this one is not reliable enough to prevent or plan a pregnancy.',
          'El embarazo es posible en los días cercanos a la ovulación. Una estimación por fechas como esta no es lo bastante confiable para evitar ni para planificar un embarazo.'
        ),
        sources: ['nhsFertility', 'bull2019']
      },
      nutrition: [
        {
          text: t(
            'Nothing specific is proven for these days. Keep to the everyday basics further down this page.',
            'No hay nada específico demostrado para estos días. Sigue con lo básico de todos los días, que encontrarás más abajo en esta página.'
          ),
          evidence: 'limited',
          sources: []
        }
      ],
      exercise: [
        {
          text: t(
            'Train as planned. Differences in performance between phases are trivial on average, and researchers recommend going by your own response.',
            'Entrena según lo planeado. Las diferencias de rendimiento entre fases son mínimas en promedio, y los investigadores recomiendan guiarte por tu propia respuesta.'
          ),
          evidence: 'moderate',
          sources: ['mcnulty2020']
        }
      ],
      productivity: [
        {
          text: t(
            'You may see this described as the best time for presentations and negotiations. A large meta-analysis found no robust change in verbal ability or other thinking skills across the cycle.',
            'Quizá lo veas descrito como el mejor momento para presentaciones y negociaciones. Un metaanálisis amplio no encontró cambios sólidos en la capacidad verbal ni en otras habilidades mentales a lo largo del ciclo.'
          ),
          evidence: 'limited',
          sources: ['jang2025']
        }
      ],
      today: {
        mood: t(
          'Some notice a mid-cycle twinge or clearer discharge. Many notice nothing.',
          'Algunas personas notan una punzada a mitad de ciclo o un flujo más claro. Muchas no notan nada.'
        ),
        nutrition: t(
          'Nothing specific is proven for these days. Keep to the basics.',
          'No hay nada específico demostrado para estos días. Sigue con lo básico.'
        ),
        exercise: t(
          'Train as planned and go by how you respond.',
          'Entrena según lo planeado y guíate por cómo respondes.'
        ),
        productivity: t(
          'There is no proven peak. Schedule by your own experience.',
          'No hay un pico demostrado. Organízate según tu propia experiencia.'
        )
      }
    },
    {
      id: 'luteal',
      name: t('Luteal phase', 'Fase lútea'),
      short: t('Luteal', 'Lútea'),
      tagline: t(
        'After ovulation: progesterone takes over',
        'Después de la ovulación: la progesterona toma el relevo'
      ),
      happening: {
        text: t(
          'After ovulation the ovary produces progesterone, along with some oestrogen, for about two weeks. If there is no pregnancy, both hormones fall in the final days and the next period begins.',
          'Después de la ovulación, el ovario produce progesterona, junto con algo de estrógeno, durante unas dos semanas. Si no hay embarazo, ambas hormonas bajan en los últimos días y comienza el siguiente periodo.'
        ),
        sources: ['statpearls', 'nhsFertility']
      },
      feel: {
        text: t(
          'The first week is often uneventful. The last week is when premenstrual symptoms appear for many people: mood swings, feeling low, anxious or irritable, tiredness, bloating, headaches and poorer sleep. They usually ease once bleeding starts.',
          'La primera semana suele transcurrir sin novedades. En la última semana aparecen, para muchas personas, los síntomas premenstruales: cambios de humor, sentirse decaída, ansiosa o irritable, cansancio, hinchazón, dolor de cabeza y peor sueño. Suelen aliviarse cuando empieza el sangrado.'
        ),
        evidence: 'strong',
        sources: ['nhsPeriods', 'nhsPmdd', 'baker2018']
      },
      note: {
        text: t(
          'If the mood symptoms are severe (intense anxiety, anger or depression, or thoughts of suicide), it may be premenstrual dysphoric disorder (PMDD). It affects roughly 2 to 3 people in every 100 and it is treatable.',
          'Si los síntomas emocionales son intensos (ansiedad, enojo o depresión muy marcados, o pensamientos suicidas), puede tratarse del trastorno disfórico premenstrual (TDPM). Afecta aproximadamente a 2 o 3 de cada 100 personas y tiene tratamiento.'
        ),
        sources: ['nhsPmdd', 'reilly2024']
      },
      nutrition: [
        {
          text: t(
            'Feeling hungrier is physiological. Studies find people eat about 170 kcal more per day in this phase, and resting metabolism may be slightly higher. Plan regular, filling meals instead of fighting your appetite.',
            'Tener más hambre es fisiológico. Los estudios encuentran que en esta fase se comen unas 170 kcal más al día, y el metabolismo en reposo podría ser algo mayor. Planifica comidas regulares y saciantes en lugar de luchar contra el apetito.'
          ),
          evidence: 'moderate',
          sources: ['tucker2025', 'benton2020']
        },
        {
          text: t(
            'For premenstrual symptoms, health services advise a balanced diet and not drinking too much alcohol.',
            'Para los síntomas premenstruales, los servicios de salud aconsejan una alimentación equilibrada y no beber demasiado alcohol.'
          ),
          evidence: 'moderate',
          sources: ['nhsPms']
        }
      ],
      exercise: [
        {
          text: t(
            'Keep moving in the premenstrual week. Regular exercise is one of the first things health services recommend for premenstrual symptoms, and yoga or meditation can help with stress.',
            'Sigue moviéndote en la semana premenstrual. El ejercicio regular es una de las primeras cosas que los servicios de salud recomiendan para los síntomas premenstruales, y el yoga o la meditación pueden ayudar con el estrés.'
          ),
          evidence: 'moderate',
          sources: ['nhsPms']
        },
        {
          text: t(
            'Strength and performance are not reliably lower in this phase. If you feel heavy or tired before your period, reduce the intensity instead of stopping.',
            'La fuerza y el rendimiento no bajan de forma constante en esta fase. Si antes del periodo te sientes pesada o cansada, reduce la intensidad en lugar de dejar de entrenar.'
          ),
          evidence: 'moderate',
          sources: ['colenso2023', 'mcnulty2020']
        }
      ],
      productivity: [
        {
          text: t(
            'Protect your sleep in the last week: keep a regular bedtime and wind down earlier. Poorer sleep before and during a period is common in people with premenstrual symptoms or painful cramps.',
            'Cuida tu sueño en la última semana: mantén un horario regular y empieza a relajarte más temprano. Dormir peor antes y durante el periodo es frecuente en quienes tienen síntomas premenstruales o cólicos dolorosos.'
          ),
          evidence: 'moderate',
          sources: ['baker2018', 'nhsPms']
        },
        {
          text: t(
            'If your notes show a difficult premenstrual stretch, plan for it: bring deadlines forward, add buffer time and move the tense conversations that can wait. Your thinking ability is unchanged, but your patience and energy may not be.',
            'Si tus registros muestran una etapa premenstrual difícil, planifica en consecuencia: adelanta entregas, deja márgenes de tiempo y cambia de fecha las conversaciones tensas que puedan esperar. Tu capacidad mental no cambia, pero tu paciencia y tu energía quizá sí.'
          ),
          evidence: 'limited',
          sources: ['jang2025']
        },
        {
          text: t(
            'Keep a symptom diary for at least two cycles. It shows your real pattern and is the first thing a health professional will ask for.',
            'Lleva un diario de síntomas durante al menos dos ciclos. Muestra tu patrón real y es lo primero que te pedirá un profesional de la salud.'
          ),
          evidence: 'strong',
          sources: ['nhsPms', 'nhsPmdd']
        }
      ],
      today: {
        mood: t(
          'Often a quiet week. Symptoms, if you get them, tend to come later.',
          'Suele ser una semana tranquila. Los síntomas, si los tienes, tienden a llegar más adelante.'
        ),
        nutrition: t(
          'A bigger appetite is normal in this phase. Plan filling meals.',
          'Es normal tener más apetito en esta fase. Planifica comidas saciantes.'
        ),
        exercise: t(
          'Train as planned. Strength is not reliably lower now.',
          'Entrena según lo planeado. La fuerza no baja de forma constante en esta fase.'
        ),
        productivity: t(
          'Use these days to get ahead if your premenstrual week is usually hard.',
          'Aprovecha estos días para adelantar trabajo si tu semana premenstrual suele ser difícil.'
        )
      },
      todayPremenstrual: {
        mood: t(
          'Mood swings, irritability or low mood are common this week and usually ease when bleeding starts.',
          'Los cambios de humor, la irritabilidad o el ánimo bajo son frecuentes esta semana y suelen aliviarse cuando empieza el sangrado.'
        ),
        nutrition: t(
          'Being hungrier than usual is normal. Eat regular meals and go easy on alcohol.',
          'Tener más hambre de lo habitual es normal. Come a horarios regulares y modera el alcohol.'
        ),
        exercise: t(
          'Keep moving, at a lower intensity if you need to. It helps with premenstrual symptoms.',
          'Sigue moviéndote, con menos intensidad si lo necesitas. Ayuda con los síntomas premenstruales.'
        ),
        productivity: t(
          'Protect your sleep and leave buffer time before deadlines.',
          'Cuida tu sueño y deja margen de tiempo antes de las entregas.'
        )
      }
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Advice that applies in every phase                                  */
  /* ------------------------------------------------------------------ */

  var basics = [
    {
      icon: 'exercise',
      title: t('Move most days', 'Muévete casi todos los días'),
      text: t(
        'Aim for 150 to 300 minutes of moderate activity a week, or 75 to 150 minutes of vigorous activity, plus regular muscle-strengthening work.',
        'Apunta a entre 150 y 300 minutos semanales de actividad moderada, o entre 75 y 150 minutos de actividad intensa, además de ejercicios regulares de fortalecimiento muscular.'
      ),
      evidence: 'strong',
      sources: ['who2020']
    },
    {
      icon: 'nutrition',
      title: t('Eat regular, balanced meals', 'Come de forma regular y equilibrada'),
      text: t(
        'Include iron-rich foods. This is the dietary advice health services give for premenstrual symptoms and for heavy periods.',
        'Incluye alimentos ricos en hierro. Es el consejo de alimentación que dan los servicios de salud para los síntomas premenstruales y para los periodos abundantes.'
      ),
      evidence: 'moderate',
      sources: ['nhsPms', 'nhsIron']
    },
    {
      icon: 'sleep',
      title: t('Keep sleep regular', 'Mantén un sueño regular'),
      text: t(
        'Getting enough sleep is part of standard advice for premenstrual symptoms, and poorer sleep is common in the days before a period for people who have them.',
        'Dormir lo suficiente forma parte del consejo habitual para los síntomas premenstruales, y dormir peor en los días previos al periodo es frecuente en quienes los tienen.'
      ),
      evidence: 'moderate',
      sources: ['nhsPms', 'baker2018']
    },
    {
      icon: 'track',
      title: t('Track your own pattern', 'Registra tu propio patrón'),
      text: t(
        'Note how you feel for at least two cycles. Averages hide large differences between people, so your own record is a better guide than any chart, including the ones on this page.',
        'Anota cómo te sientes durante al menos dos ciclos. Los promedios esconden grandes diferencias entre personas, así que tu propio registro es mejor guía que cualquier gráfico, incluidos los de esta página.'
      ),
      evidence: 'strong',
      sources: ['nhsPms', 'mcnulty2020']
    }
  ];

  /* ------------------------------------------------------------------ */
  /* Situations the four-phase model does not describe                   */
  /* ------------------------------------------------------------------ */

  var fit = [
    {
      icon: 'pill',
      title: t('Hormonal contraception', 'Anticonceptivos hormonales'),
      text: t(
        'Methods such as the combined pill, the patch and the injection work by stopping ovulation, so the hormone pattern described here does not apply. Tracking how you feel is still useful.',
        'Métodos como la píldora combinada, el parche y la inyección actúan impidiendo la ovulación, así que el patrón hormonal descrito aquí no se aplica. Aun así, registrar cómo te sientes sigue siendo útil.'
      ),
      sources: ['nhsPeriods']
    },
    {
      icon: 'irregular',
      title: t('Irregular cycles', 'Ciclos irregulares'),
      text: t(
        'Periods count as irregular when the gap between them is less than 21 days or more than 35 days. Date-based estimates will not work well. A doctor can check for causes such as polycystic ovary syndrome (PCOS, now also called PMOS) or a thyroid problem.',
        'Los periodos se consideran irregulares cuando el intervalo entre ellos es menor de 21 días o mayor de 35. Las estimaciones por fechas no funcionarán bien. Un profesional de la salud puede buscar causas como el síndrome de ovario poliquístico (SOP) o un problema de tiroides.'
      ),
      sources: ['nhsIrregular']
    },
    {
      icon: 'life',
      title: t('Puberty and the approach of menopause', 'Pubertad y cercanía de la menopausia'),
      text: t(
        'Irregular periods are common at both ends of the reproductive years, so phase estimates are less dependable then.',
        'Los periodos irregulares son frecuentes al principio y al final de los años reproductivos, así que en esas etapas las estimaciones por fase son menos confiables.'
      ),
      sources: ['nhsIrregular']
    },
    {
      icon: 'mood',
      title: t('Pregnancy and after menopause', 'Embarazo y después de la menopausia'),
      text: t(
        'There is no menstrual cycle to follow, so this guide does not apply.',
        'No hay un ciclo menstrual que seguir, así que esta guía no se aplica.'
      ),
      sources: []
    }
  ];

  /* ------------------------------------------------------------------ */
  /* When to seek care                                                   */
  /* ------------------------------------------------------------------ */

  var help = {
    items: [
      {
        text: t(
          'You need to change your pad or tampon every 1 to 2 hours, you pass clots larger than about 2.5 cm, or you bleed for more than 7 days.',
          'Necesitas cambiar la toalla sanitaria o el tampón cada 1 o 2 horas, expulsas coágulos de más de unos 2,5 cm o sangras durante más de 7 días.'
        ),
        sources: ['nhsHeavy']
      },
      {
        text: t(
          'Period pain is severe or stops you doing your usual activities, or your periods have become heavier or irregular.',
          'El dolor menstrual es intenso o te impide hacer tus actividades habituales, o tus periodos se han vuelto más abundantes o irregulares.'
        ),
        sources: ['nhsPain']
      },
      {
        text: t(
          'You bleed between periods or after sex.',
          'Sangras entre periodos o después de tener relaciones sexuales.'
        ),
        sources: ['nhsHeavy']
      },
      {
        text: t(
          'Your cycles are regularly shorter than 21 days or longer than 35 days.',
          'Tus ciclos duran habitualmente menos de 21 días o más de 35.'
        ),
        sources: ['nhsIrregular']
      },
      {
        text: t(
          'You have missed three periods in a row and a pregnancy test is negative.',
          'Te han faltado tres periodos seguidos y la prueba de embarazo es negativa.'
        ),
        sources: ['nhsMissed', 'nhsPeriods']
      },
      {
        text: t(
          'Premenstrual symptoms affect your daily life, or self-care has not helped.',
          'Los síntomas premenstruales afectan tu vida diaria, o las medidas de autocuidado no han ayudado.'
        ),
        sources: ['nhsPms']
      },
      {
        text: t(
          'You are often very tired or short of breath and your periods are heavy. Ask about a blood test for iron.',
          'A menudo estás muy cansada o te falta el aire, y tus periodos son abundantes. Pregunta por un análisis de hierro en sangre.'
        ),
        sources: ['nhsIron', 'munro2023']
      }
    ],
    urgent: {
      text: t(
        'If you have thoughts of harming yourself or ending your life, at any point in your cycle, contact your local emergency number or a crisis line straight away. Severe premenstrual mood symptoms are a recognised condition, and you deserve support.',
        'Si tienes pensamientos de hacerte daño o de quitarte la vida, en cualquier momento del ciclo, contacta de inmediato al número de emergencias de tu país o a una línea de ayuda en crisis. Los síntomas emocionales premenstruales intensos son una condición reconocida, y mereces apoyo.'
      ),
      sources: ['nhsPmdd']
    },
    treatments: {
      text: t(
        'Treatments that help with severe premenstrual symptoms include certain antidepressants (SSRIs), some hormonal contraceptives and cognitive behavioural therapy.',
        'Entre los tratamientos que ayudan con los síntomas premenstruales intensos están ciertos antidepresivos (ISRS), algunos anticonceptivos hormonales y la terapia cognitivo-conductual.'
      ),
      sources: ['nhsPmdd', 'acog2023']
    }
  };

  /* ------------------------------------------------------------------ */
  /* Sources                                                             */
  /* ------------------------------------------------------------------ */

  /**
   * `kind` is 'guidance' (health service page), 'review' (systematic review,
   * meta-analysis, narrative review or clinical guideline) or 'study' (single study).
   * Citations stay in their original language.
   */
  var sources = [
    {
      id: 'nhsFertility',
      kind: 'guidance',
      cite: 'NHS. Periods and fertility in the menstrual cycle.',
      url: 'https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/'
    },
    {
      id: 'nhsPeriods',
      kind: 'guidance',
      cite: 'NHS. Periods.',
      url: 'https://www.nhs.uk/conditions/periods/'
    },
    {
      id: 'statpearls',
      kind: 'review',
      cite: 'StatPearls. Physiology, menstrual cycle. NCBI Bookshelf, NBK500020.',
      url: 'https://www.ncbi.nlm.nih.gov/books/NBK500020/'
    },
    {
      id: 'bull2019',
      kind: 'study',
      cite: 'Bull et al. (2019). Real-world menstrual cycle characteristics of more than 600,000 menstrual cycles. npj Digital Medicine, 2, 83.',
      doi: '10.1038/s41746-019-0152-7'
    },
    {
      id: 'pierson2021',
      kind: 'study',
      cite: "Pierson et al. (2021). Daily, weekly, seasonal and menstrual cycles in women's mood, behaviour and vital signs. Nature Human Behaviour, 5, 716–725.",
      doi: '10.1038/s41562-020-01046-9'
    },
    {
      id: 'romans2012',
      kind: 'review',
      cite: 'Romans et al. (2012). Mood and the menstrual cycle: a review of prospective data studies. Gender Medicine, 9(5), 361–384.',
      doi: '10.1016/j.genm.2012.07.003'
    },
    {
      id: 'reilly2024',
      kind: 'review',
      cite: 'Reilly et al. (2024). The prevalence of premenstrual dysphoric disorder: systematic review and meta-analysis. Journal of Affective Disorders, 349, 534–540.',
      doi: '10.1016/j.jad.2024.01.066'
    },
    {
      id: 'nhsPms',
      kind: 'guidance',
      cite: 'NHS. PMS (premenstrual syndrome).',
      url: 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/'
    },
    {
      id: 'nhsPmdd',
      kind: 'guidance',
      cite: 'NHS. PMDD (premenstrual dysphoric disorder).',
      url: 'https://www.nhs.uk/conditions/pmdd-premenstrual-dysphoric-disorder/'
    },
    {
      id: 'acog2023',
      kind: 'review',
      cite: 'American College of Obstetricians and Gynecologists (2023). Management of premenstrual disorders: ACOG Clinical Practice Guideline No. 7. Obstetrics & Gynecology, 142(6), 1516–1533.',
      doi: '10.1097/AOG.0000000000005426'
    },
    {
      id: 'mcnulty2020',
      kind: 'review',
      cite: 'McNulty et al. (2020). The effects of menstrual cycle phase on exercise performance in eumenorrheic women: a systematic review and meta-analysis. Sports Medicine, 50(10), 1813–1827.',
      doi: '10.1007/s40279-020-01319-3'
    },
    {
      id: 'colenso2023',
      kind: 'review',
      cite: "Colenso-Semple et al. (2023). Current evidence shows no influence of women's menstrual cycle phase on acute strength performance or adaptations to resistance exercise training. Frontiers in Sports and Active Living, 5, 1054542.",
      doi: '10.3389/fspor.2023.1054542'
    },
    {
      id: 'armour2019',
      kind: 'review',
      cite: 'Armour et al. (2019). Exercise for dysmenorrhoea. Cochrane Database of Systematic Reviews, Issue 9, CD004142.',
      doi: '10.1002/14651858.CD004142.pub4'
    },
    {
      id: 'who2020',
      kind: 'review',
      cite: 'Bull et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. British Journal of Sports Medicine, 54(24), 1451–1462.',
      doi: '10.1136/bjsports-2020-102955'
    },
    {
      id: 'tucker2025',
      kind: 'review',
      cite: 'Tucker et al. (2025). The effect of the menstrual cycle on energy intake: a systematic review and meta-analysis. Nutrition Reviews, 83(3), e866.',
      doi: '10.1093/nutrit/nuae093'
    },
    {
      id: 'benton2020',
      kind: 'review',
      cite: 'Benton et al. (2020). Effect of menstrual cycle on resting metabolism: a systematic review and meta-analysis. PLOS ONE, 15(7), e0236025.',
      doi: '10.1371/journal.pone.0236025'
    },
    {
      id: 'munro2023',
      kind: 'review',
      cite: 'Munro et al. (2023). The relationship between heavy menstrual bleeding, iron deficiency, and iron deficiency anemia. American Journal of Obstetrics and Gynecology, 229(1), 1–9.',
      doi: '10.1016/j.ajog.2023.01.017'
    },
    {
      id: 'nhsIron',
      kind: 'guidance',
      cite: 'NHS. Iron deficiency anaemia.',
      url: 'https://www.nhs.uk/conditions/iron-deficiency-anaemia/'
    },
    {
      id: 'jang2025',
      kind: 'review',
      cite: 'Jang et al. (2025). Menstrual cycle effects on cognitive performance: a meta-analysis. PLOS ONE, 20(3), e0318576.',
      doi: '10.1371/journal.pone.0318576'
    },
    {
      id: 'schoep2019',
      kind: 'study',
      cite: 'Schoep et al. (2019). Productivity loss due to menstruation-related symptoms: a nationwide cross-sectional survey among 32 748 women. BMJ Open, 9(6), e026186.',
      doi: '10.1136/bmjopen-2018-026186'
    },
    {
      id: 'baker2018',
      kind: 'review',
      cite: 'Baker & Lee (2018). Menstrual cycle effects on sleep. Sleep Medicine Clinics, 13(3), 283–294.',
      doi: '10.1016/j.jsmc.2018.04.002'
    },
    {
      id: 'nhsHeavy',
      kind: 'guidance',
      cite: 'NHS. Heavy periods.',
      url: 'https://www.nhs.uk/conditions/heavy-periods/'
    },
    {
      id: 'nhsPain',
      kind: 'guidance',
      cite: 'NHS. Period pain.',
      url: 'https://www.nhs.uk/symptoms/period-pain/'
    },
    {
      id: 'nhsIrregular',
      kind: 'guidance',
      cite: 'NHS. Irregular periods.',
      url: 'https://www.nhs.uk/symptoms/irregular-periods/'
    },
    {
      id: 'nhsMissed',
      kind: 'guidance',
      cite: 'NHS. Missed or late periods.',
      url: 'https://www.nhs.uk/symptoms/missed-or-late-periods/'
    },
    {
      id: 'uhbFertility',
      kind: 'guidance',
      cite: 'University Hospitals Birmingham NHS Foundation Trust. Your fertility.',
      url: 'https://www.uhb.nhs.uk/services/fertility/your-fertility.htm'
    }
  ];

  return {
    LANGUAGES: LANGUAGES,
    EVIDENCE_LEVELS: EVIDENCE_LEVELS,
    ui: ui,
    evidence: evidence,
    toolNotes: toolNotes,
    hormones: hormones,
    findings: findings,
    phases: phases,
    basics: basics,
    fit: fit,
    help: help,
    sources: sources
  };
});
