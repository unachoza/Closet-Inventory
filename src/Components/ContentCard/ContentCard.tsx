import "./ContentCard.css"

interface ContentCardProps {
      title: string;
      children?: React.ReactNode |string;
}

const ContentCard = ({ title, children }: ContentCardProps) => {
      return (
            <div className="content-card">
                  <h1>{title}</h1>
                  {children}
            </div>
      );
};

export default ContentCard;