using BusinessLayer.Exceptions;
using ModelLayer.DTOs.Notes;
using System.Text.RegularExpressions;

namespace BusinessLayer.Rules
{
    public static partial class NoteRules
    {
        private static readonly string[] ValidColors = new[]
        {
            // Frontend palette (Google Keep style)
            "#FFFFFF", // Default
            "#FAAFA8", // Coral
            "#F39F76", // Peach
            "#FFF8B8", // Sand
            "#E2F6D3", // Mint
            "#B4DDD3", // Sage
            "#D4E4ED", // Fog
            "#AECCDC", // Storm
            "#D3BFDB", // Dusk
            "#F6E2DD", // Blossom
            "#E9E3D4", // Clay
            "#EFEFF1", // Chalk

            // Backward compatibility (legacy palette)
            "#F28B82", // Red
            "#FBBC04", // Orange
            "#FFF475", // Yellow
            "#CCFF90", // Green
            "#A7FFEB", // Teal
            "#CBF0F8", // Cyan
            "#AECBFA", // Blue
            "#D7AEFB", // Purple
            "#FDCFE8", // Pink
            "#E6C9A8", // Brown
            "#E8EAED"  // Gray
        };

        public static void ValidateCreate(CreateNoteDto dto)
        {
            // At least title or content is required
            if (string.IsNullOrWhiteSpace(dto.Title) && string.IsNullOrWhiteSpace(dto.Content))
                throw new ValidationException("Either title or content is required");

            // Validate title if provided
            if (!string.IsNullOrWhiteSpace(dto.Title))
            {
                if (dto.Title.Length > 200)
                    throw new ValidationException("Title cannot exceed 200 characters");

                // Check for excessive whitespace
                if (dto.Title.Trim().Length == 0)
                    throw new ValidationException("Title cannot be only whitespace");
            }

            // Validate content if provided
            if (!string.IsNullOrWhiteSpace(dto.Content))
            {
                if (dto.Content.Length > 10000)
                    throw new ValidationException("Content cannot exceed 10,000 characters");
            }

            // Validate color if provided
            if (!string.IsNullOrWhiteSpace(dto.Color))
            {
                ValidateColor(dto.Color);
            }
        }

        public static void ValidateUpdate(UpdateNoteDto dto)
        {
            // Check if both title and content are being cleared
            bool titleIsEmpty = dto.Title != null && string.IsNullOrWhiteSpace(dto.Title);
            bool contentIsEmpty = dto.Content != null && string.IsNullOrWhiteSpace(dto.Content);
            
            if (titleIsEmpty && contentIsEmpty)
                throw new ValidationException("Either title or content must have a value");

            // Validate title if provided
            if (dto.Title != null)
            {
                if (dto.Title.Length > 200)
                    throw new ValidationException("Title cannot exceed 200 characters");
            }

            // Validate content if provided
            if (dto.Content != null)
            {
                if (dto.Content.Length > 10000)
                    throw new ValidationException("Content cannot exceed 10,000 characters");
            }
        }

        public static void ValidateColor(string color)
        {
            if (string.IsNullOrWhiteSpace(color))
                throw new ValidationException("Color is required");

            // Trim and uppercase for comparison
            color = color.Trim().ToUpper();

            // Check if it's a valid hex color format
            if (!IsValidHexColor(color))
                throw new ValidationException("Invalid color format. Use hex format (e.g., #FFFFFF)");

            // Check if it's one of the allowed colors
            if (!ValidColors.Contains(color))
                throw new ValidationException($"Color must be one of the predefined colors: {string.Join(", ", ValidColors)}");
        }

        public static void ValidateSearchQuery(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                throw new ValidationException("Search query cannot be empty");

            if (query.Length > 200)
                throw new ValidationException("Search query cannot exceed 200 characters");

            // Remove excessive whitespace
            query = query.Trim();

            if (query.Length < 2)
                throw new ValidationException("Search query must be at least 2 characters long");
        }

        public static void ValidateBulkDelete(IEnumerable<int> noteIds)
        {
            if (noteIds == null || !noteIds.Any())
                throw new ValidationException("At least one note ID is required");

            if (noteIds.Count() > 100)
                throw new ValidationException("Cannot delete more than 100 notes at once");

            // Check for duplicate IDs
            if (noteIds.Distinct().Count() != noteIds.Count())
                throw new ValidationException("Duplicate note IDs are not allowed");

            // Check for invalid IDs (negative or zero)
            if (noteIds.Any(id => id <= 0))
                throw new ValidationException("Invalid note ID detected");
        }

        private static bool IsValidHexColor(string color)
        {
            var regex = HexColorRegex();
            return regex.IsMatch(color);
        }

        [GeneratedRegex(@"^#([A-Fa-f0-9]{6})$")]
        private static partial Regex HexColorRegex();
    }
}