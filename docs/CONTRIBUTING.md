# Contributing Guide

Thank you for your interest in contributing to the Next.js Serverless Playground! This guide will help you get started with contributing to the project.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Contribution Guidelines](#contribution-guidelines)
5. [Pull Request Process](#pull-request-process)
6. [Issue Guidelines](#issue-guidelines)
7. [Coding Standards](#coding-standards)
8. [Testing Requirements](#testing-requirements)
9. [Documentation](#documentation)
10. [Community](#community)

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git for version control
- AWS CLI configured (for infrastructure contributions)
- A GitHub account

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/copilot-agent-playground.git
   cd copilot-agent-playground
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/20m61/copilot-agent-playground.git
   ```

3. **Install dependencies**
   ```bash
   # Next.js application
   cd nextjs-app
   npm install
   
   # Infrastructure
   cd ../infrastructure
   npm install
   ```

4. **Set up environment**
   ```bash
   # Copy environment template
   cp nextjs-app/.env.example nextjs-app/.env.local
   
   # Configure AWS credentials
   aws configure
   ```

5. **Verify setup**
   ```bash
   cd nextjs-app
   npm run dev
   
   # Open http://localhost:3000
   ```

## 🔄 Development Process

### Workflow Overview

1. **Create an issue** (for new features or bugs)
2. **Fork and clone** the repository
3. **Create a feature branch** from `main`
4. **Make your changes** with tests
5. **Test thoroughly** locally
6. **Submit a pull request**
7. **Code review** and iterate
8. **Merge** after approval

### Branch Naming Convention

Use descriptive branch names that include the type of change:

```bash
# Feature branches
git checkout -b feature/user-authentication
git checkout -b feature/email-notifications

# Bug fix branches
git checkout -b fix/api-error-handling
git checkout -b fix/deployment-issue

# Documentation branches
git checkout -b docs/api-documentation
git checkout -b docs/deployment-guide

# Infrastructure branches
git checkout -b infra/monitoring-alerts
git checkout -b infra/cost-optimization
```

### Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Update your main branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature
git rebase main
```

## 📝 Contribution Guidelines

### Types of Contributions

We welcome various types of contributions:

#### 🐛 Bug Reports
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/logs if applicable

#### ✨ Feature Requests
- Clear description of the feature
- Use case and motivation
- Proposed implementation approach
- Consider backward compatibility

#### 🔧 Code Contributions
- Bug fixes
- New features
- Performance improvements
- Refactoring
- Infrastructure improvements

#### 📚 Documentation
- API documentation
- Tutorials and guides
- Code comments
- README improvements
- Architecture documentation

#### 🧪 Testing
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security tests

### Areas for Contribution

#### Frontend (Next.js Application)
- User interface improvements
- New React components
- Performance optimizations
- Accessibility enhancements
- Mobile responsiveness

#### Backend (API Routes)
- New API endpoints
- Database integrations
- Authentication/authorization
- Caching mechanisms
- Error handling improvements

#### Infrastructure (AWS CDK)
- New AWS services integration
- Cost optimization
- Security enhancements
- Monitoring improvements
- CI/CD pipeline enhancements

#### DevOps and Tooling
- GitHub Actions workflows
- Deployment automation
- Development tools
- Build optimizations
- Monitoring and alerting

## 🔀 Pull Request Process

### Before Submitting

1. **Test your changes thoroughly**
   ```bash
   # Run all tests
   npm test
   npm run test:e2e
   
   # Check linting
   npm run lint
   
   # Type checking
   npm run type-check
   
   # Build verification
   npm run build
   ```

2. **Update documentation**
   - Update README if necessary
   - Add/update API documentation
   - Update code comments
   - Add changelog entry

3. **Ensure clean commit history**
   ```bash
   # Squash commits if necessary
   git rebase -i HEAD~3
   
   # Write clear commit messages
   git commit -m "feat: add user authentication system"
   ```

### PR Title and Description

#### Title Format
```
<type>(<scope>): <description>

Examples:
feat(auth): add JWT authentication system
fix(api): resolve timeout error in /api/users
docs(readme): update installation instructions
infra(monitoring): add CloudWatch dashboards
```

#### PR Description Template
```markdown
## Description
Brief description of changes and motivation.

## Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🏗️ Infrastructure change
- [ ] 🔧 Refactoring (no functional changes)

## Related Issues
Fixes #123
Closes #456

## Testing
- [ ] I have tested this change locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have checked that the build succeeds

## Infrastructure Changes (if applicable)
- [ ] CDK changes have been tested with `cdk synth`
- [ ] Changes follow AWS best practices
- [ ] Cost impact has been considered
- [ ] Security implications have been reviewed

## Screenshots (if applicable)
Add screenshots or GIFs to help explain your changes.

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published
```

### Review Process

1. **Automated checks** must pass
2. **At least one maintainer review** required
3. **Address feedback** and update PR
4. **Final approval** from maintainer
5. **Merge** using squash merge

## 📋 Issue Guidelines

### Bug Reports

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS, Windows, Ubuntu]
 - Browser [e.g. chrome, safari]
 - Node.js version [e.g. 18.0.0]
 - Project version [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Implementation suggestions**
If you have ideas about how this could be implemented, please share them.
```

## 💻 Coding Standards

### TypeScript/JavaScript

```typescript
// Use TypeScript for all new code
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Use descriptive function names
async function createUserAccount(userData: CreateUserRequest): Promise<User> {
  // Implementation
}

// Use proper error handling
try {
  const user = await createUserAccount(userData);
  return user;
} catch (error) {
  logger.error('Failed to create user account', { error, userData });
  throw new Error('User creation failed');
}

// Use meaningful variable names
const isUserAuthenticated = checkUserAuthentication(token);
const userPermissions = getUserPermissions(user.id);
```

### React Components

```typescript
// Use functional components with TypeScript
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      className={`btn btn-${variant} ${disabled ? 'btn-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
};

// Use proper prop destructuring
// Include default values
// Use meaningful prop names
```

### API Routes

```typescript
// nextjs-app/src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Define request/response schemas
const CreateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = CreateUserSchema.parse(body);
    
    // Business logic
    const user = await userService.createUser(validatedData);
    
    return NextResponse.json(
      { user, success: true },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    logger.error('User creation failed', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Infrastructure Code

```typescript
// infrastructure/lib/stacks/example-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface ExampleStackProps extends cdk.StackProps {
  stage: string;
  // Define props with clear types
}

export class ExampleStack extends cdk.Stack {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: ExampleStackProps) {
    super(scope, id, props);

    // Use descriptive resource names
    this.function = new lambda.Function(this, 'ExampleFunction', {
      functionName: `example-function-${props.stage}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'),
      environment: {
        STAGE: props.stage,
      },
      // Include cost optimization settings
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
    });

    // Add outputs
    new cdk.CfnOutput(this, 'FunctionName', {
      value: this.function.functionName,
      description: 'Example function name',
    });
  }
}
```

### Code Style Rules

1. **Use TypeScript** for all new code
2. **Prefer async/await** over promises
3. **Use meaningful names** for variables and functions
4. **Add comments** for complex logic
5. **Handle errors** properly
6. **Use consistent formatting** (Prettier)
7. **Follow ESLint rules**
8. **Write self-documenting code**

## ✅ Testing Requirements

### Unit Tests

All new features must include unit tests:

```typescript
// __tests__/components/Button.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Tests

API endpoints must have integration tests:

```typescript
// __tests__/api/users.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users';

describe('/api/users', () => {
  it('creates user with valid data', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        name: 'John Doe',
        email: 'john@example.com',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.user).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

### Test Coverage

- **Unit tests**: >80% coverage required
- **Integration tests**: All API endpoints
- **E2E tests**: Critical user flows
- **Infrastructure tests**: CDK constructs

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/lcov-report/index.html
```

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Creates a new user account with the provided data
 * 
 * @param userData - User registration data
 * @param userData.name - Full name of the user
 * @param userData.email - Email address (must be unique)
 * @param userData.password - Password (will be hashed)
 * @returns Promise that resolves to the created user object
 * @throws {ValidationError} When input data is invalid
 * @throws {ConflictError} When email already exists
 * 
 * @example
 * ```typescript
 * const user = await createUser({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   password: 'securepassword'
 * });
 * ```
 */
async function createUser(userData: CreateUserRequest): Promise<User> {
  // Implementation
}
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing installation/setup process
- Modifying configuration options
- Adding new dependencies

### API Documentation

Update `docs/API.md` when:
- Adding new endpoints
- Changing request/response formats
- Modifying authentication requirements
- Adding new error codes

## 🌟 Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bug reports and feature requests
- **Discord/Slack**: Real-time chat (if available)

### Recognition

Contributors will be recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- GitHub contributor graph
- Annual contributor highlights

### Mentorship

New contributors can get help from:
- **Good first issue** labels for beginners
- **Mentor available** tags for guided contributions
- **Help wanted** labels for community input

## 🎯 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

### Examples

```bash
feat(auth): add JWT authentication system

Add JWT-based authentication with refresh tokens.
Includes middleware for protected routes and token
validation utilities.

Closes #123

fix(api): resolve timeout error in user creation

The user creation endpoint was timing out due to
database connection pool exhaustion. Added proper
connection management and error handling.

Fixes #456

docs(readme): update installation instructions

Added missing steps for AWS CLI configuration and
clarified Node.js version requirements.
```

## ⚡ Performance Guidelines

### Frontend Performance

- Use Next.js Image component for optimized images
- Implement code splitting with dynamic imports
- Minimize bundle size
- Use proper caching strategies
- Optimize Core Web Vitals

### Backend Performance

- Implement proper database indexing
- Use connection pooling
- Add response caching where appropriate
- Optimize Lambda cold starts
- Monitor and optimize memory usage

### Infrastructure Performance

- Use appropriate AWS service configurations
- Implement cost optimization measures
- Set up proper monitoring and alerting
- Use CDN for static assets
- Optimize database queries

## 🔐 Security Guidelines

### Code Security

- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all inputs
- Implement proper authentication and authorization
- Use HTTPS everywhere
- Keep dependencies updated

### Infrastructure Security

- Follow AWS security best practices
- Use IAM roles with least privilege
- Enable logging and monitoring
- Encrypt data in transit and at rest
- Regular security audits

## 📞 Contact

For questions about contributing:

- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: General questions and ideas
- **Email**: [maintainer-email] for sensitive issues

---

Thank you for contributing to the Next.js Serverless Playground! Your contributions help make this project better for everyone. 🎉