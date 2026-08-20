class Document < ApplicationRecord
  include HtmlSanitizer

  belongs_to :workspace
  belongs_to :project, optional: true
  belongs_to :author, class_name: "User"
  belongs_to :parent, class_name: "Document", optional: true

  has_many :children, class_name: "Document", foreign_key: :parent_id, dependent: :destroy
  has_many :comments, as: :commentable, dependent: :destroy
  has_many :activities, as: :trackable, dependent: :destroy

  validates :title, presence: true
  before_save :sanitize_content

  scope :roots, -> { where(parent_id: nil) }
  scope :ordered, -> { order(:position, :created_at) }

  # Retorna os IDs de todos os descendentes aninhados recursivamente
  def descendant_ids
    children.flat_map { |child| [child.id] + child.descendant_ids }
  end

  # Converte o conteúdo HTML do documento em Markdown limpo
  def to_markdown
    html = content.to_s
    return "# #{title}\n\n" if html.blank?

    md = html.dup
    
    # Code blocks
    md.gsub!(/<pre><code>(.*?)<\/code><\/pre>/m) { "\n```\n#{$1.strip}\n```\n" }
    
    # Headers
    md.gsub!(/<h1>(.*?)<\/h1>/i) { "\n# #{$1.strip}\n\n" }
    md.gsub!(/<h2>(.*?)<\/h2>/i) { "\n## #{$1.strip}\n\n" }
    md.gsub!(/<h3>(.*?)<\/h3>/i) { "\n### #{$1.strip}\n\n" }
    
    # Task list items
    md.gsub!(/<li[^>]*data-checked="true"[^>]*>(.*?)<\/li>/im) { "- [x] #{strip_tags($1).strip}\n" }
    md.gsub!(/<li[^>]*data-checked="false"[^>]*>(.*?)<\/li>/im) { "- [ ] #{strip_tags($1).strip}\n" }
    
    # Lists
    md.gsub!(/<li>(.*?)<\/li>/i) { "- #{$1.strip}\n" }
    md.gsub!(/<\/?(ul|ol)[^>]*>/i, "\n")
    
    # Blockquotes
    md.gsub!(/<blockquote>(.*?)<\/blockquote>/im) { |m| "\n> #{strip_tags($1).strip.gsub("\n", "\n> ")}\n\n" }
    
    # Inline formatting
    md.gsub!(/<(strong|b)>(.*?)<\/(strong|b)>/i) { "**#{$2}**" }
    md.gsub!(/<(em|i)>(.*?)<\/(em|i)>/i) { "*#{$2}*" }
    md.gsub!(/<(s|strike|del)>(.*?)<\/(s|strike|del)>/i) { "~~#{$2}~~" }
    md.gsub!(/<code>(.*?)<\/code>/i) { "`#{$1}`" }
    md.gsub!(/<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/i) { "[#{$2}](#{$1})" }
    
    # Paragraphs & Breaks
    md.gsub!(/<p>(.*?)<\/p>/i) { "#{$1}\n\n" }
    md.gsub!(/<hr\s*\/?>/i, "\n---\n\n")
    md.gsub!(/<br\s*\/?>/i, "\n")
    
    # Remove remaining HTML tags
    md = ActionController::Base.helpers.strip_tags(md)
    
    "# #{title}\n\n" + md.gsub(/\n{3,}/, "\n\n").strip + "\n"
  end

  # Cria uma cópia fiel do documento
  def duplicate!(author:)
    dup_doc = self.dup
    dup_doc.title = "#{self.title} (Cópia)"
    dup_doc.author = author
    dup_doc.created_at = Time.current
    dup_doc.updated_at = Time.current
    dup_doc.save!
    dup_doc
  end

  private

  def sanitize_content
    self.content = sanitize_html_field(content) if content.present?
  end

  def strip_tags(html)
    ActionController::Base.helpers.strip_tags(html)
  end
end
