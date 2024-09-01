  class WikiLinks < Jekyll::Generator
    def generate(site)
      all_notes = site.collections['notes'].docs
      all_pages = site.pages
  
      all_docs = all_notes + all_pages
  
      all_docs.each do |current_note|
        current_note.content = current_note.content.gsub(/\[\[(.*?)\]\]/) do |match|
          title = $1
          matching_note = all_docs.find {|note| note.data['title'].downcase == title.downcase }
          
          if matching_note
            "[#{title}]({{ '#{matching_note.url}' | relative_url }})"
          else
            "[[#{title}]]"
          end
        end
      end
    end
  end