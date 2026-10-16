require "test_helper"

class DocumentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @workspace = workspaces(:one)
    @project = projects(:one)
    @document = documents(:one)
    sign_in @user
  end

  test "should get show" do
    get workspace_project_document_url(@workspace, @project, @document)
    assert_response :success
  end

  test "should get new" do
    get new_workspace_project_document_url(@workspace, @project)
    assert_response :success
  end

  test "should create document" do
    assert_difference("Document.count") do
      post workspace_project_documents_url(@workspace, @project), params: {
        document: {
          title: "Novo Documento de Teste",
          content: "<p>Conteudo do doc</p>",
          icon: "📄"
        }
      }
    end

    assert_redirected_to workspace_project_document_url(@workspace, @project, Document.last)
  end

  test "should update document" do
    patch workspace_project_document_url(@workspace, @project, @document), params: {
      document: {
        title: "Título Atualizado",
        content: "<p>Novo conteudo</p>"
      }
    }
    assert_redirected_to workspace_project_document_url(@workspace, @project, @document)
  end

  test "should update document with json" do
    patch workspace_project_document_url(@workspace, @project, @document, format: :json), params: {
      document: {
        title: "Título JSON",
        content: "<p>Novo conteudo JSON</p>"
      }
    }
    assert_response :success
  end

  test "move não deve aceitar pai de outro projeto/workspace" do
    foreign_parent_id = Document.create!(workspace: workspaces(:two), project: projects(:two), author: users(:two), title: "Pai alheio", icon: "document").id
    patch move_workspace_project_document_url(@workspace, @project, @document), params: { parent_id: foreign_parent_id, position: 1 }
    assert_response :not_found
    assert_nil @document.reload.parent_id
  end

  test "move não deve aceitar pai inexistente como destino" do
    patch move_workspace_project_document_url(@workspace, @project, @document), params: { parent_id: 999_999, position: 1 }
    assert_response :not_found
  end
end