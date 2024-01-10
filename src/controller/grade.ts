import { periodos, salas } from '../data';
import { isNumeric, normalizeString, findSimilarStrings } from '../utils/communs';

interface Sala {
  alias: string,
  professor: string,
  periodo: number,
  bloco: number,
  sala: number,
}

type SalasKey = keyof typeof salas;

class Grade {
  private formatMessage(grade: Sala, sigla: string): string {
    return `Componente: ${grade.alias} (${sigla.toUpperCase()})\nProfessor: ${grade.professor}\nPeriódo: ${grade.periodo}°\nBloco: ${grade.bloco} | Sala: ${grade.sala}\n-------------------------------\n`;
  }

  private searchBy(toSearch: string[], by: 'alias' | 'professor'): string {
    let msg = '';
    periodos.forEach(periodo => {
      periodo.forEach(p => {
        const current = salas[p as SalasKey];
        const choice = normalizeString(current[by]).split(' ');

        for (let i = 0; i < toSearch.length; i++) {
          if (choice.some(target => findSimilarStrings(toSearch[i], target) && target[0] === toSearch[i][0])) {
            msg += this.formatMessage(current, p);
            break;
          }
        }
      });
    });
    return msg === '' ? 'Achei pica nenhuma' : msg;
  }

  public info(message: string): string {
    // Search by periodo
    if (isNumeric(message)) {
      const periodoToSearch = parseInt(message);
      if (periodoToSearch <= 0 || periodoToSearch > 9)
        return 'Nem existe esse periodo fdp';

      const targetSalas = periodos[periodoToSearch - 1];
      let str = '';
      targetSalas.forEach(currentSala => {
        const grade: Sala = salas[currentSala as SalasKey];
        str += this.formatMessage(grade, currentSala);
      });
      return str;
    }

    // Search by sigla
    const grade = salas[message.toLowerCase() as SalasKey];
    if (grade)
      return this.formatMessage(grade, message);

    // Search by professor
    if (message.includes('p=')) {
      const toSearch = normalizeString(message.slice(2)).split(' ');
      return this.searchBy(toSearch, 'professor');
    }

    // Search by alias
    const toSearch = normalizeString(message).split(' ');
    return this.searchBy(toSearch, 'alias');
  }

  public send(): void {
  }

  public update(): void {
  }
}

export default Grade;
