namespace ModelLayer.DTOs.Notes
{
    public class ReorderNotesDto
    {
        public List<NoteOrderItem> NoteOrders { get; set; } = new();
    }

    public class NoteOrderItem
    {
        public int NoteId { get; set; }
        public int DisplayOrder { get; set; }
    }
}
