# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: LS
      - heading "Admin Panel" [level=3] [ref=e6]
    - generic [ref=e8]:
      - generic [ref=e9]:
        - text: Email
        - textbox "Email" [ref=e10]:
          - /placeholder: admin@example.com
      - generic [ref=e11]:
        - text: Password
        - textbox "Password" [ref=e12]:
          - /placeholder: Enter password
      - button "Sign In" [ref=e13] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e14]
```