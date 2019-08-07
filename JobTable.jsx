'use strict';

const colors = ['#c00', '#222', '#0c0'];

function JobTable(props) {
  const jobs = props.source.map(j => ({
    race: j.race,
    job: j.job,
    stats: j.bases.concat(j.growths),
    statsVsAll: j.basesVsAll.concat(j.growthsVsAll),
    statsVsRace: j.basesVsRace.concat(j.growthsVsRace),
  }));

  const races = jobs.reduce((result, j) => {
    if (!result.includes(j.race)) result.push(j.race);

    return result;
  }, []);

  return (
    <Gradient colors={props.gradient} length={101}>
      <JobFilterTable jobs={jobs} races={races} />
    </Gradient>
  );
};

class JobFilterTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortColumn: null,
      sortDirection: -1, // descending
      groupByRace: true,
      colorByRace: true,
    };

    this.headerLabels = ['Race', 'Job', 'HP', 'MP', 'Atk', 'Def', 'Mag', 'Res', 'Spd', 'BST', 'HP', 'MP', 'Atk', 'Def', 'Mag', 'Res', 'Spd', 'GRT', ];

    this.sortBy = this.sortBy.bind(this);
    this.toggleGroup = this.toggleGroup.bind(this);
    this.toggleColor = this.toggleColor.bind(this);
    this.getHeaders = this.getHeaders.bind(this);
  }

  sortBy(n) {
    this.setState(prevState => {
      const nextState = {
        sortColumn: n,
        sortDirection: -1,
      };

      if (n === null) return nextState; // reset

      if (prevState.sortColumn === n) {
        nextState.sortDirection = -prevState.sortDirection; // toggle
      } else if (n === -1) {
        nextState.sortDirection = 1; // ascending sort on job column
      };

      return nextState;
    });
  }

  toggleGroup(e) {
    const val = e.target.checked;

    this.setState({ groupByRace: val, colorByRace: val, });
  }

  toggleColor(e) {
    const val = e.target.checked;

    this.setState(prevState => ({ colorByRace: prevState.groupByRace && val, }));
  }

  getHeaders() {
    const col = this.state.sortColumn;
    const sortCols = this.headerLabels.slice(1);
    const sortIcon = this.state.sortDirection > 0 ? '▲' : '▼';

    return (
      <tr>
        <th onClick={() => this.sortBy(null)}>Race</th>
        {sortCols.map((l, i) => (<th key={i} onClick={() => this.sortBy(i - 1)}>{l} {col === (i - 1) ? sortIcon : ''}</th>))}
      </tr>
    );
  }

  strCmp(a, b) {
    if (a > b) return 1;
    if (a < b) return -1;

    return 0;
  }

  render() {
    const { gradient, jobs, races, } = this.props;
    const { sortColumn, sortDirection, groupByRace, colorByRace, } = this.state;

    const scale = colorByRace ? 'statsVsRace' : 'statsVsAll';
    const statCmp = (a, b) => (a[scale][sortColumn] - b[scale][sortColumn]) * sortDirection;
    const jobCmp = (a, b) => this.strCmp(a.job, b.job) * sortDirection;

    const block = [];

    if (groupByRace) {
      const raceGroups = races.reduce((result, r) => (result[r] = [], result), {});

      jobs.forEach(j => raceGroups[j.race].push(j));

      races.forEach(r => {
        const raceJobs = raceGroups[r].slice();

        if (sortColumn === -1) {
          raceJobs.sort(jobCmp);
        } else if (sortColumn || sortColumn === 0) {
          raceJobs.sort(statCmp);
        };

        block.push(raceJobs);
      });
    } else {
      const allJobs = jobs.slice();

        if (sortColumn === -1) {
          allJobs.sort(jobCmp);
        } else if (sortColumn || sortColumn === 0) {
          allJobs.sort(statCmp);
        };

      block.push(allJobs);
    };

    const headers = this.getHeaders();

    const rows = block.map(b => (
      <React.Fragment key={b[0].race}>
        {headers}
        {b.map(j => (
          <tr key={j.race + j.job}>
            <td>{j.race}</td>
            <td>{j.job}</td>
            {j.stats.map((s, i) => {
              const score = j[scale][i];
              const isExtreme = score === 100 || score === 0;

              return (<td key={i} style={{ color: gradient[score], fontWeight: isExtreme ? 'bold' : 'normal', }}>{s}</td>);
            })}
          </tr>
        ))}
      </React.Fragment>
    ));

    return (
      <div>
        <label>
          <input type="checkbox" checked={groupByRace} onChange={this.toggleGroup} />
          {' '}
          Group by race
        </label>
        <br />
        <label>
          <input type="checkbox" checked={colorByRace} onChange={this.toggleColor} disabled={!groupByRace} />
          {' '}
          Rank by race
        </label>
        <br />
        <table className="table table-striped">
          <tbody>
            {rows}
          </tbody>
        </table>
        <div className="text-center">
          Base stats and growth rates taken from TFergusson's <a href="https://gamefaqs.gamespot.com/gba/560436-final-fantasy-tactics-advance/faqs/26262">Mechanics Guide</a>
        </div>
        <br />
      </div>
    );
  };
}

ReactDOM.render(<JobTable source={jobs} gradient={colors} />, document.getElementById('app'));
