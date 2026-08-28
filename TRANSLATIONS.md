# Traduzioni HORIZON

Il sito supporta quattro lingue:

- `en` — inglese
- `it` — italiano
- `de` — tedesco
- `fr` — francese

## Dove modificare i testi

Ogni lingua ha un file dedicato in `js/locales/`:

- `en.js`
- `it.js`
- `de.js`
- `fr.js`

Le chiavi sono raggruppate per area del sito (`common`, `home`, `live`, `map`, `dashboard`, `gallery`, `replay`, `progress`, `project`, `admin`, `status`, `errors` e `meta`). Per cambiare un testo basta cercare la stessa chiave nei quattro file e modificare il valore.

## Aggiungere un nuovo testo nell'HTML

Per il contenuto di un elemento:

```html
<h2 data-i18n="home.exampleTitle">English fallback</h2>
```

Per attributi come `aria-label`, `title`, `placeholder` o `content`:

```html
<button
    aria-label="English fallback"
    data-i18n-attr='{"aria-label":"common.exampleLabel"}'>
</button>
```

La nuova chiave deve essere aggiunta a tutti e quattro i file in `js/locales/`.

## Aggiungere un testo dinamico in JavaScript

```js
const label = window.HorizonI18n.t('live.exampleStatus') || 'English fallback';
```

Non usare la frase inglese come chiave e non inserire testi visibili direttamente nella logica.

## Controllo automatico

Eseguire:

```bash
npm test
```

Il controllo `tools/i18n-check.js` verifica che:

- tutte le chiavi esistano in tutte le lingue;
- nessuna traduzione sia vuota;
- ogni pagina carichi i quattro dizionari;
- non ricompaia il vecchio formato `copy:`;
- non siano presenti caratteri evidentemente corrotti nelle traduzioni.
