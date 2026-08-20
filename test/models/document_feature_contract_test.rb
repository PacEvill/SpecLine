require "test_helper"

class DocumentFeatureContractTest < ActiveSupport::TestCase
  setup do
    @workspace = workspaces(:one)
    @project = projects(:one)
    @user = users(:one)
    @document = documents(:one)
  end

  test "contract: document should have to_markdown method" do
    @document.content = "<h1>Título do Documento</h1><p>Parágrafo de exemplo com <strong>negrito</strong>.</p>"
    markdown = @document.to_markdown
    assert_not_nil markdown
    assert_includes markdown, "# Título do Documento"
  end

  test "contract: document duplication creates a valid copy" do
    copy = @document.duplicate!(author: @user)
    assert_not_nil copy
    assert copy.persisted?
    assert_includes copy.title, "Cópia"
    assert_equal @document.content, copy.content
    assert_equal @document.icon, copy.icon
    assert_equal @document.workspace_id, copy.workspace_id
    assert_equal @document.project_id, copy.project_id
  end
end
