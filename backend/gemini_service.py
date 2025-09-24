"""
Gemini AI Service for Super Website Editor
Provides AI-powered design suggestions, CSS generation, and content improvements
"""
import asyncio
import json
import os
from typing import Dict, List, Optional, Any
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Load environment variables
load_dotenv()

class GeminiAIService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
        
        # Initialize chat instance for design suggestions
        self.design_chat = LlmChat(
            api_key=self.api_key,
            session_id="design-assistant",
            system_message="You are an expert UI/UX designer and CSS specialist. Help users create beautiful, modern websites with professional design patterns. Provide specific, actionable suggestions with modern CSS techniques including gradients, shadows, animations, and responsive design."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Initialize chat for CSS generation
        self.css_chat = LlmChat(
            api_key=self.api_key,
            session_id="css-generator", 
            system_message="You are a CSS expert. Generate clean, modern CSS code based on user requirements. Use modern techniques like flexbox, grid, custom properties, and animations. Always provide complete, working CSS that follows best practices."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Initialize chat for content improvement
        self.content_chat = LlmChat(
            api_key=self.api_key,
            session_id="content-improver",
            system_message="You are a content strategist and copywriter. Help improve website content to be more engaging, professional, and conversion-focused. Provide suggestions that maintain the original meaning while enhancing clarity and impact."
        ).with_model("gemini", "gemini-2.0-flash")

    async def generate_design_suggestions(self, element_info: Dict[str, Any]) -> Dict[str, Any]:
        """Generate design improvement suggestions for a specific element"""
        try:
            element_type = element_info.get('tagName', 'div').lower()
            current_styles = element_info.get('styles', {})
            content = element_info.get('textContent', '')[:200]  # Limit content length
            
            prompt = f"""
            I have a {element_type} element with the following properties:
            - Current styles: {json.dumps(current_styles, indent=2)}
            - Content preview: "{content}"
            
            Please provide 5 modern design improvement suggestions. For each suggestion, provide:
            1. A descriptive name
            2. The complete CSS that would achieve this design
            3. A brief explanation of why this improves the design
            
            Focus on modern trends like:
            - Glassmorphism and neumorphism effects
            - Modern color gradients
            - Subtle shadows and animations
            - Improved typography and spacing
            - Better responsiveness
            
            Return your response as a JSON array with this structure:
            [
                {{
                    "name": "suggestion name",
                    "css": "complete css code",
                    "description": "why this improves the design"
                }}
            ]
            """
            
            message = UserMessage(text=prompt)
            response = await self.design_chat.send_message(message)
            
            # Try to parse JSON response
            try:
                suggestions = json.loads(response)
                if isinstance(suggestions, list):
                    return {"success": True, "suggestions": suggestions}
            except json.JSONDecodeError:
                pass
            
            # If JSON parsing fails, return the raw response
            return {
                "success": True,
                "suggestions": [{
                    "name": "AI Design Suggestion",
                    "css": "",
                    "description": response
                }]
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def generate_css_from_description(self, description: str, element_type: str = "div") -> Dict[str, Any]:
        """Generate CSS based on a text description"""
        try:
            prompt = f"""
            Generate modern CSS for a {element_type} element based on this description:
            "{description}"
            
            Provide clean, production-ready CSS that includes:
            - Modern properties and techniques
            - Proper fallbacks for older browsers
            - Responsive design considerations
            - Performance optimizations
            
            Return only the CSS code without any explanations or markdown formatting.
            """
            
            message = UserMessage(text=prompt)
            response = await self.css_chat.send_message(message)
            
            # Clean up the response to extract just CSS
            css_code = response.strip()
            if css_code.startswith("```css"):
                css_code = css_code[6:]
            if css_code.endswith("```"):
                css_code = css_code[:-3]
            
            return {"success": True, "css": css_code.strip()}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def improve_content(self, content: str, content_type: str = "general") -> Dict[str, Any]:
        """Improve website content for better engagement"""
        try:
            prompt = f"""
            Improve this {content_type} content to make it more engaging and professional:
            
            Original: "{content}"
            
            Please provide an improved version that:
            - Maintains the original meaning and intent
            - Uses more engaging and professional language  
            - Improves readability and flow
            - Adds impact without being overly promotional
            - Is appropriate for a modern professional website
            
            Return only the improved text without explanations.
            """
            
            message = UserMessage(text=prompt)
            response = await self.content_chat.send_message(message)
            
            return {"success": True, "improved_content": response.strip()}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def generate_color_palette(self, theme: str = "modern") -> Dict[str, Any]:
        """Generate a modern color palette"""
        try:
            json_structure = """
            {
                "palette": {
                    "primary": {"hex": "#000000", "rgb": "0, 0, 0", "use": "description"},
                    "secondary": {"hex": "#000000", "rgb": "0, 0, 0", "use": "description"},
                    "accent": {"hex": "#000000", "rgb": "0, 0, 0", "use": "description"},
                    "background": {"hex": "#000000", "rgb": "0, 0, 0", "use": "description"},
                    "text": {"hex": "#000000", "rgb": "0, 0, 0", "use": "description"}
                },
                "css_variables": "css custom properties code"
            }
            """
            
            prompt = f"""
            Generate a modern {theme} color palette for a professional website.
            
            Provide:
            - 5 main colors (primary, secondary, accent, background, text)
            - Each color in both HEX and RGB format
            - Brief description of when to use each color
            - CSS custom properties format for easy implementation
            
            Return as JSON with this structure: {json_structure}
            """
            
            message = UserMessage(text=prompt)
            response = await self.design_chat.send_message(message)
            
            try:
                palette_data = json.loads(response)
                return {"success": True, **palette_data}
            except json.JSONDecodeError:
                return {"success": False, "error": "Failed to parse color palette response"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def analyze_element_for_improvements(self, element_html: str, context: str = "") -> Dict[str, Any]:
        """Analyze an HTML element and suggest improvements"""
        try:
            prompt = f"""
            Analyze this HTML element and suggest improvements:
            
            HTML: {element_html}
            Context: {context}
            
            Provide suggestions for:
            1. Accessibility improvements
            2. SEO enhancements  
            3. Performance optimizations
            4. Visual design improvements
            5. User experience enhancements
            
            Return as JSON array with structure:
            [
                {{
                    "category": "accessibility|seo|performance|design|ux",
                    "suggestion": "specific suggestion", 
                    "implementation": "how to implement this",
                    "impact": "why this matters"
                }}
            ]
            """
            
            message = UserMessage(text=prompt)
            response = await self.design_chat.send_message(message)
            
            try:
                suggestions = json.loads(response)
                return {"success": True, "suggestions": suggestions}
            except json.JSONDecodeError:
                return {"success": True, "suggestions": [{"category": "general", "suggestion": response, "implementation": "", "impact": ""}]}
            
        except Exception as e:
            return {"success": False, "error": str(e)}


# Global service instance
gemini_service = GeminiAIService()