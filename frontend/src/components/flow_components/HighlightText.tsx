import { MAX_LENGTH_FOR_HIGHLIGHT } from "../../const";

export function highlightText(flowText: string, search_string: string, flag_string: string) {
  if (flowText.length > MAX_LENGTH_FOR_HIGHLIGHT || flag_string === '') {
    return flowText
  }
  try {
    const flag_regex = new RegExp(`(${flag_string})`, 'g');
    const search_regex = new RegExp(`(${search_string})`, 'gi');
    const combined_regex = new RegExp(`${search_regex.source}|${flag_regex.source}`, 'gi');
    let parts;
    if (search_string !== '') {
      parts = flowText.split(combined_regex);
    } else {
      parts = flowText.split(flag_regex);
    }
    const searchClasses = "bg-orange-200 rounded-sm"
    const flagClasses = "bg-red-200 rounded-sm"
    return <span>{ parts.map((part, i) => 
        <span key={i} className={ (search_string !== '' && search_regex.test(part)) ? searchClasses : (flag_regex.test(part) ? flagClasses : '') }>
            { part }
        </span>)
    }</span>;
  } catch(error) {
    console.log(error)
    return flowText;
  }
}
