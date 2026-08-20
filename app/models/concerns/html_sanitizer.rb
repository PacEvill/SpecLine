# frozen_string_literal: true

module HtmlSanitizer
  extend ActiveSupport::Concern

  ALLOWED_TAGS = %w[
    p br strong em u s h1 h2 h3 h4 h5 h6 ul ol li
    blockquote code pre a span div table thead tbody tr th td img hr
  ].freeze

  ALLOWED_ATTRIBUTES = {
    "a" => %w[href target rel title class],
    "span" => %w[class data-type data-id style],
    "code" => %w[class],
    "pre" => %w[class],
    "img" => %w[src alt title width height class],
    "td" => %w[colspan rowspan style class],
    "th" => %w[colspan rowspan style class],
    "div" => %w[class style data-type]
  }.freeze

  def sanitize_html_field(content_str)
    return "" if content_str.blank?

    ActionController::Base.helpers.sanitize(
      content_str,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRIBUTES
    )&.scrub!(:strip)
  end
end
