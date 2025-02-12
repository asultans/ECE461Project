import simpleGit, { SimpleGit, LogResult, DefaultLogFields } from 'simple-git';

interface Contributor {
  name: string;
  commitCount: number;
}

interface Issue {
  isBug: boolean;
  status: string;
}

//Bus Factor = Total Code Contributions by Top Contributors / Total Code Contributions
export async function calculateBusFactor(repositoryUrl: string, localDirectory: string, topContributorsCount: number = 3): Promise<number> {
  // Initialize SimpleGit
  const git: SimpleGit = simpleGit({ baseDir: localDirectory });

  try {
    // Clone the Git repository
    await git.clone(repositoryUrl, localDirectory);
    console.log('Repository cloned successfully.');

    // Get the list of commit log lines
    const log: LogResult<DefaultLogFields> = await git.log();

    // Create a map to store commit counts per contributor
    const commitCounts = new Map<string, number>();

    // Iterate through the commit log and count contributions
    for (const commit of log.all) {
      const author = commit.author_name;

      // If the author is already in the map, increment their commit count
      if (commitCounts.has(author)) {
        commitCounts.set(author, commitCounts.get(author)! + 1);
      } else {
        // Otherwise, initialize their commit count to 1
        commitCounts.set(author, 1);
      }
    }

    // Sort contributors by commit count in descending order
    const sortedContributors = Array.from(commitCounts.entries()).sort((a, b) => b[1] - a[1]);

    // Calculate the total code contributions by top contributors
    let totalTopContributions = 0;
    for (let i = 0; i < topContributorsCount && i < sortedContributors.length; i++) {
      totalTopContributions += sortedContributors[i][1];
    }

    // Calculate the total code contributions for the entire project
    const totalContributions = log.total;

    // Calculate the Bus Factor
    const busFactor = totalTopContributions / totalContributions;

    return busFactor;
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error; // Re-throw the error if needed
  }
}


export function netScore(ls: number, bf: number, rm: number, cs: number, ru: number) {
  return (ls * (bf * 0.3 + rm * 0.3 + cs * 0.1 + ru * 0.2)); // Adjust the weights as needed
}

export function responsiveMaintainer(date: number) {
  // Calculate the number of days since the last publish
  const currentDate = new Date();
  const lastPublishDate = new Date(date);
  const daysSinceLastPublish = Math.floor((currentDate.getTime() - lastPublishDate.getTime()) / (1000 * 60 * 60 * 24));
  let resp: number = 1 - (daysSinceLastPublish / 365);
  if (resp > 0) {
    return resp;
  }
  return 0;
}

export function RampUp(weekly: number) {
  let score: number = weekly / 100000000;
  if (score < 1) {
    return score;
  }
  return 1;
}

export function licenseCheck(readmeContent: string): number {
  // Use regex to parse the project readme and check for the required license
  const licenseRegex = /GNU Lesser General Public License v2\.1/;
  const hasLicense = licenseRegex.test(readmeContent);

  // Return a score of 1 if the license matches, 0 otherwise
  return hasLicense ? 1 : 0;
}

export function calculateCorrectnessScore(issues: Issue[]): number {
  // Implement your logic to calculate the "correctness" score based on issues
  // For example, you can count open bugs and calculate a score
  const openBugs = issues.filter((issue) => issue.isBug && issue.status === 'open').length;
  const totalBugs = issues.filter((issue) => issue.isBug).length;

  // Calculate the correctness score as the ratio of open bugs to total bugs
  if (totalBugs === 0) {
    return 1; // If there are no bugs, consider it perfect
  }
  return 1 - openBugs / totalBugs;
}
