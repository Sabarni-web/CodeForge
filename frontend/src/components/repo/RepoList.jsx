import RepoCard from './RepoCard';

const RepoList = ({ repos, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass-card p-6 h-48 animate-pulse">
            <div className="h-6 w-2/3 bg-dark-700 rounded mb-4" />
            <div className="h-4 w-full bg-dark-800 rounded mb-2" />
            <div className="h-4 w-5/6 bg-dark-800 rounded" />
            <div className="mt-12 flex gap-4">
              <div className="h-4 w-16 bg-dark-800 rounded" />
              <div className="h-4 w-16 bg-dark-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!repos?.length) {
    return (
      <div className="glass-card p-12 text-center border-dashed border-2">
        <h3 className="text-lg font-medium text-dark-200 mb-2">No repositories found</h3>
        <p className="text-dark-400 text-sm">Create a new repository or explore public ones.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <RepoCard key={repo._id} repo={repo} />
      ))}
    </div>
  );
};

export default RepoList;
