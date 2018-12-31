using System;
using TestService.Extensions;

namespace TestService.Models
{
    public class RunnerQuery : IQueryObject
    {
        // Filtering
        public int Id { get; set; }
        public string RunnerType { get; set; }
        public string AppName { get; set; }
        public string Description { get; set; }
        public string Command { get; set; }
        public string Active { get; set; }
        public string AutoRun { get; set; }
        public string Environment { get; set; }
        public DateTime RunDate { get; set; }
        public string RunCode { get; set; }
        public string Status { get; set; }

        // Sorting
        public string SortBy { get; set; }
        public bool IsSortAscending { get; set; }

        // Paging
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
